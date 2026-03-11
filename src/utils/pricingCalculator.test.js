import { describe, it, expect } from 'vitest';
import PricingCalculator from './pricingCalculator';

describe('PricingCalculator', () => {
  describe('calculatePriceFromMargin', () => {
    it('deve calcular o preço de venda e o lucro corretamente baseando-se na margem alvo', () => {
      // Exemplo Mercado Livre Premium:
      // Custo: R$ 50
      // Fixo ML: R$ 6
      // Frete Vendedor: R$ 0
      // Embalagem: R$ 2
      // Comissão: 16%
      // Imposto: 4%
      // Margem Alvo: 15%
      
      const result = PricingCalculator.calculatePriceFromMargin({
        cost: 50,
        fixedFee: 6,
        shippingCost: 0,
        operationalCost: 2,
        commissionPercent: 16,
        taxesPercent: 4,
        targetMarginPercent: 15
      });

      // Custos fixos = 50 + 6 + 2 = 58
      // Variáveis % = 16 + 4 + 15 = 35% -> 0.35
      // Preço de venda = 58 / (1 - 0.35) = 58 / 0.65 = 89.2307...
      
      expect(result.finalPrice).toBe(89.23);
      
      // Lucro = 89.23 * 0.15 = 13.38
      expect(result.rawProfit).toBeCloseTo(13.38, 1);
    });

    it('deve emitir erro quando as porcentagens superarem ou igualarem 100%', () => {
      expect(() => {
        PricingCalculator.calculatePriceFromMargin({
          cost: 10,
          commissionPercent: 50,
          taxesPercent: 20,
          targetMarginPercent: 30 // soma = 100%
        });
      }).toThrowError('100%');
    });
  });

  describe('calculateMarginFromPrice', () => {
    it('deve calcular o lucro e margem corretamente para um preço exato (concorrencia)', () => {
      const result = PricingCalculator.calculateMarginFromPrice({
        finalPrice: 89.23,
        cost: 50,
        fixedFee: 6,
        shippingCost: 0,
        operationalCost: 2,
        commissionPercent: 16,
        taxesPercent: 4
      });

      // Se cobrar 89.23, deve voltar aos ~15% de margem e R$ 13.38 de lucro
      expect(result.rawProfit).toBeCloseTo(13.38, 1);
      expect(result.marginPercent).toBeCloseTo(15, 1);
    });

    it('deve retornar lucro negativo se o preço de venda for muito baixo', () => {
      const result = PricingCalculator.calculateMarginFromPrice({
        finalPrice: 60, // Muito baixo os custos fixos deram 58. (sobra 2 reais pra pagar os 20% variavel)
        cost: 50,
        fixedFee: 6,
        shippingCost: 0,
        operationalCost: 2,
        commissionPercent: 16,
        taxesPercent: 4
      });

      // 20% de 60 = cobe 12 reais.
      // Custo fico = 58 + 12 variaveis = 70 custo total
      // Preço 60 - 70 = Lucro -10
      expect(result.rawProfit).toBe(-10);
      expect(result.marginPercent).toBe(-16.67);
    });
  });
});
