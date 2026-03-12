/**
 * Financing Calculator Component
 * Interactive tool for calculating auto loan payments
 */

export function FinancingCalculator() {
  return {
    calculate(loanAmount, interestRate, termMonths) {
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
      const totalPayment = monthlyPayment * termMonths;
      const totalInterest = totalPayment - loanAmount;
      
      return {
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        apr: interestRate,
        termMonths: termMonths
      };
    },
    
    render() {
      return `
        <div class="financing-calculator-component">
          <h2>Financing Calculator</h2>
          <div class="calculator-form">
            <div class="input-group">
              <label>Loan Amount ($)</label>
              <input type="number" id="loanAmount" value="30000">
            </div>
            <div class="input-group">
              <label>Interest Rate (%)</label>
              <input type="number" id="interestRate" value="5.5" step="0.1">
            </div>
            <div class="input-group">
              <label>Term (months)</label>
              <select id="termMonths">
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48" selected>48 months</option>
                <option value="60">60 months</option>
                <option value="72">72 months</option>
              </select>
            </div>
            <button onclick="calculatePayment()">Calculate</button>
          </div>
          <div class="results" id="results" style="display:none">
            <h3>Payment Details</h3>
            <p>Monthly Payment: $<span id="monthlyPayment"></span></p>
            <p>Total Interest: $<span id="totalInterest"></span></p>
            <p>Total Payment: $<span id="totalPayment"></span></p>
          </div>
        </div>
      `;
    }
  };
}

export const CalculationResult = {};