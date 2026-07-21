let pendingResult = null;

export function setLoanCalculatorResult(result) {
    pendingResult = { ...result };
}

export function consumeLoanCalculatorResult() {
    const result = pendingResult;
    pendingResult = null;
    return result;
}
