
import { GoogleGenAI } from "@google/genai";
import { Appointment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAgendaSummary = async (appointments: Appointment[]) => {
  try {
    const formattedAgenda = appointments
      .filter(a => a.status !== 'disponivel')
      .map(a => `${a.time} - ${a.patientName} (Tratamento: ${a.treatment || 'Não informado'}) [Status: ${a.status}]`)
      .join('\n');

    if (!formattedAgenda) return "Sua agenda está vazia para este dia.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um assistente pessoal de um dentista. Analise a agenda abaixo e faça um resumo executivo:
      1. Quantos pacientes no total.
      2. Destaque os tipos de tratamentos previstos.
      3. Verifique se há muitos cancelamentos.
      Termine com uma frase motivadora curta.
      
      Agenda:
      ${formattedAgenda}`,
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao gerar resumo da IA:", error);
    return "Não foi possível gerar o resumo inteligente agora.";
  }
};

export const getPatientTip = async (patientName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma mensagem curta para o dentista enviar via WhatsApp para o paciente ${patientName} confirmando o agendamento. Seja formal mas amigável.`,
    });
    return response.text;
  } catch (error) {
    return `Agendamento confirmado para ${patientName}!`;
  }
};
