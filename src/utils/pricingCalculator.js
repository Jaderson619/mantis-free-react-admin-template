/**
 * pricingCalculator.js
 * Utilitário dinâmico para cálculo de preços e margens em e-commerces.
 */

class PricingCalculator {
  /**
   * Calcula o Preço Final de Venda baseado na Margem de Lucro Desejada
   * 
   * @param {Object} params
   * @param {number} params.cost - Custo do Produto (Custo NFe ou Manual)
   * @param {number} params.operationalCost - Outros custos (embalagem, etc)
   * @param {number} params.shippingCost - Frete pago pelo vendedor
   * @param {number} params.fixedFee - Tarifa fixa do Marketplace por venda
   * @param {number} params.commissionPercent - Comissão do Marketplace (em %)
   * @param {number} params.taxesPercent - Impostos sobre venda (Simples Nacional, etc) (em %)
   * @param {number} params.targetMarginPercent - Margem de Lucro baseada no preço final (em %)
   * 
   * @returns {Object} { finalPrice, rawProfit }
   */
  static calculatePriceFromMargin({
    cost = 0,
    operationalCost = 0,
    shippingCost = 0,
    fixedFee = 0,
    commissionPercent = 0,
    taxesPercent = 0,
    targetMarginPercent = 0
  }) {
    const totalFixedCosts = Number(cost) + Number(operationalCost) + Number(shippingCost) + Number(fixedFee);
    const totalVariablePercent = Number(commissionPercent) + Number(taxesPercent) + Number(targetMarginPercent);

    if (totalVariablePercent >= 100) {
      throw new Error("A soma das porcentagens (Comissão + Imposto + Margem) não pode ser igual ou maior que 100%.");
    }

    const variableDecimal = totalVariablePercent / 100;
    
    // Formula: Preço = Custos Fixos / (1 - % Variáveis)
    const finalPrice = totalFixedCosts / (1 - variableDecimal);
    
    // Calcula o lucro bruto que sobrou
    const commissionValue = finalPrice * (commissionPercent / 100);
    const taxesValue = finalPrice * (taxesPercent / 100);
    const rawProfit = finalPrice - totalFixedCosts - commissionValue - taxesValue;

    return {
      finalPrice: Number(finalPrice.toFixed(2)),
      rawProfit: Number(rawProfit.toFixed(2)),
      breakdown: {
        cost: Number(cost),
        operationalCost: Number(operationalCost),
        shippingCost: Number(shippingCost),
        fixedFee: Number(fixedFee),
        commissionValue: Number(commissionValue.toFixed(2)),
        taxesValue: Number(taxesValue.toFixed(2)),
        totalCost: Number((totalFixedCosts + commissionValue + taxesValue).toFixed(2))
      }
    };
  }

  /**
   * Calcula a Margem e Lucro baseados em um Preço de Venda Definido (Análise da Concorrência)
   * 
   * @param {Object} params - mesmos parâmetros acima, mas trocando targetMarginPercent por finalPrice
   * @param {number} params.finalPrice - Preço pretendido para o produto
   */
  static calculateMarginFromPrice({
    finalPrice = 0,
    cost = 0,
    operationalCost = 0,
    shippingCost = 0,
    fixedFee = 0,
    commissionPercent = 0,
    taxesPercent = 0
  }) {
    if (finalPrice <= 0) return { rawProfit: 0, marginPercent: 0, breakdown: null };

    const totalFixedCosts = Number(cost) + Number(operationalCost) + Number(shippingCost) + Number(fixedFee);
    const commissionValue = Number(finalPrice) * (Number(commissionPercent) / 100);
    const taxesValue = Number(finalPrice) * (Number(taxesPercent) / 100);

    const rawProfit = finalPrice - totalFixedCosts - commissionValue - taxesValue;
    const marginPercent = (rawProfit / finalPrice) * 100;

    return {
      rawProfit: Number(rawProfit.toFixed(2)),
      marginPercent: Number(marginPercent.toFixed(2)),
      breakdown: {
        cost: Number(cost),
        operationalCost: Number(operationalCost),
        shippingCost: Number(shippingCost),
        fixedFee: Number(fixedFee),
        commissionValue: Number(commissionValue.toFixed(2)),
        taxesValue: Number(taxesValue.toFixed(2)),
        totalCost: Number((totalFixedCosts + commissionValue + taxesValue).toFixed(2))
      }
    };
  }
}

export default PricingCalculator;
