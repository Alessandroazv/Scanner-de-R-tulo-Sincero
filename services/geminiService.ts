
import { GoogleGenAI } from "@google/genai";
import { Goal, Verdict } from '../types';
import type { AnalysisResultData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-3-flash-preview";

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

const getMimeType = (base64DataUrl: string): string => {
    return base64DataUrl.substring(base64DataUrl.indexOf(':') + 1, base64DataUrl.indexOf(';'));
}

const parseAnalysis = (text: string): AnalysisResultData => {
    const lines = text.split('\n').filter(line => line.trim() !== '');

    let verdict: Verdict | null = null;
    let truth = '';
    const details: string[] = [];
    let conclusion = '';

    let currentSection = '';

    for (const line of lines) {
        if (line.startsWith('**VEREDITO:**')) {
            const verdictString = line.replace('**VEREDITO:**', 'VEREDITO:').trim();
            if (Object.values(Verdict).includes(verdictString as Verdict)) {
                 verdict = verdictString as Verdict;
            } else {
                console.warn(`Unknown verdict: ${verdictString}`);
                verdict = Verdict.Moderation;
            }
            currentSection = '';
        } else if (line.startsWith('**A Verdade Nua e Crua:**')) {
            currentSection = 'truth';
        } else if (line.startsWith('**Os Detalhes Sórdidos (Análise dos Ingredientes):**')) {
            currentSection = 'details';
        } else if (line.startsWith('**Conclusão:**')) {
            currentSection = 'conclusion';
        } else {
            switch (currentSection) {
                case 'truth':
                    truth += line.trim() + ' ';
                    break;
                case 'details':
                    if (line.trim().startsWith('*')) {
                        details.push(line.trim().substring(1).trim());
                    }
                    break;
                case 'conclusion':
                    conclusion += line.trim() + ' ';
                    break;
            }
        }
    }
    
    if (!verdict) {
      throw new Error("Could not parse verdict from response.");
    }

    return {
        verdict: verdict,
        truth: truth.trim(),
        details,
        conclusion: conclusion.trim(),
    };
};

export const analyzeProduct = async (imagesBase64: string[], goal: Goal): Promise<AnalysisResultData> => {
  const prompt = `
### PERSONA
Você é o "Nutri Sincero", uma inteligência artificial especializada em análise nutricional e engenharia de alimentos. Sua missão é combater o "health-washing" (marketing enganoso de alimentos) e empoderar o consumidor com a verdade nua e crua sobre o que ele está prestes a comer. Você é direto, baseia-se na ciência e não tem paciência para rótulos que tentam enganar o consumidor.

### TAREFA
O usuário enviará imagens de embalagens de alimentos (frente, rótulo nutricional e lista de ingredientes) e informará seu objetivo principal. Você deve analisar as imagens e dar um veredito claro. O objetivo do usuário é: **${goal}**.

### PROTOCOLO DE ANÁLISE (O SEGREDO)
Siga esta ordem mental para analisar a imagem:

1.  **Leitura dos Ingredientes (Crucial):** Lembre-se que a lista está em ordem decrescente. Os 3 primeiros ingredientes definem o produto.
    * *Alerta Vermelho:* Procure por "açúcar disfarçado" (xarope de milho, maltodextrina, dextrose, sacarose, açúcar invertido, suco concentrado de maçã).
    * *Alerta Laranja:* Procure por excesso de aditivos químicos com nomes impronunciáveis (conservantes, corantes artificiais).
    * *Farinhas:* Se diz "Integral" na frente, mas o primeiro ingrediente é "Farinha de trigo enriquecida com ferro..." (que é farinha branca), é um golpe.

2.  **Cruzamento com a Tabela:** Olhe a porção. Se o produto tem muito sódio ou gordura trans para uma porção pequena, sinalize.

3.  **Adaptação ao Objetivo do Usuário:**
    * **Se "Emagrecimento":** Seja rigoroso com calorias vazias, açúcares e carboidratos refinados.
    * **Se "Ganho de Massa":** Foque na quantidade e qualidade da proteína versus a quantidade de açúcar.
    * **Se "Saúde Geral":** Foque no grau de processamento (quanto menos ingredientes, melhor).

### FORMATO DA RESPOSTA (O que o usuário vê na tela)
Use emojis para facilitar a leitura rápida no supermercado. Siga ESTE FORMATO EXATAMENTE.

**VEREDITO:** [Use um destes: 🟢 APROVADO / 🟡 COM MODERAÇÃO / 🔴 É CILADA, BINO!]

**A Verdade Nua e Crua:**
[Resumo em 2 frases diretas. Ex: "A embalagem diz 'Fit', mas o segundo ingrediente é açúcar disfarçado (maltodextrina). Vai travar seu emagrecimento."]

**Os Detalhes Sórdidos (Análise dos Ingredientes):**
* 🚨 [Aponte o pior ingrediente e por que ele é ruim para o objetivo do usuário].
* 🧐 [Aponte outro ponto de atenção, ex: excesso de sódio].
* ✅ [Aponte algo positivo, se houver. Ex: "Pelo menos usa whey protein de boa qualidade"].

**Conclusão:** [Frase final de impacto. Ex: "Devolva para a prateleira e pegue um iogurte natural de 2 ingredientes."]
`;

  const imageParts = imagesBase64.map(imgData => {
      // Assuming the full data URL is passed, but the API needs raw base64
      const base64String = imgData.split(',')[1] || imgData;
      const mimeType = getMimeType(imgData) || 'image/jpeg';
      return fileToGenerativePart(base64String, mimeType);
  });
  
  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }, ...imageParts] }
    });
    
    if (!response.text) {
        throw new Error("API retornou uma resposta vazia.");
    }

    console.log("Raw API Response:", response.text);
    return parseAnalysis(response.text);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao comunicar com a API do Gemini.");
  }
};
