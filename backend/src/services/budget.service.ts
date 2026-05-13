import { prisma } from '../config/prisma';

// Tabela base de preço por categoria (em centavos para evitar floats)
const BASE_PRICE: Record<string, [number, number]> = {
  plumb:  [120, 280],
  bolt:   [120, 320],
  hammer: [200, 800],
  brush:  [350, 900],
  spray:  [140, 320],
  sofa:   [120, 600],
  hvac:   [180, 480],
  leaf:   [90, 240],
};

const URGENCY_MULT: Record<string, number> = {
  now: 1.6,
  today: 1.25,
  today2: 1.25,
  week: 1.0,
  week2: 1.0,
  flex: 0.85,
  unsure: 1.1,
  month: 1.1,
};

export async function estimateBudget(
  userId: string | undefined,
  categoryId: string,
  answers: Record<string, string>,
) {
  const base = BASE_PRICE[categoryId] ?? [150, 300];
  let [min, max] = base;

  const urgency = answers.urgency ?? answers.when ?? 'flex';
  const mult = URGENCY_MULT[urgency] ?? 1;
  min = Math.round(min * mult);
  max = Math.round(max * mult);

  const item = await prisma.budgetEstimate.create({
    data: {
      userId,
      categoryId,
      answers,
      estimateMin: min,
      estimateMax: max,
    },
  });

  return {
    id: item.id,
    estimateMin: min,
    estimateMax: max,
    currency: 'BRL',
    breakdown: [
      { label: 'Visita técnica', value: 'R$ 80' },
      { label: 'Mão de obra (1–2h)', value: `R$ ${Math.round(min * 0.5)} – ${Math.round(max * 0.5)}` },
      { label: 'Material básico', value: `R$ ${Math.round(min * 0.15)} – ${Math.round(max * 0.2)}` },
    ],
  };
}
