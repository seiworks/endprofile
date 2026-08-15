export function asFiniteNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function calculateLoanAmount(totalPrice, downPayment) {
    return Math.max(asFiniteNumber(totalPrice) - Math.max(asFiniteNumber(downPayment), 0), 0);
}

export function calculateLoanBreakdownFromLtv(totalPrice, ltv) {
    const safeTotalPrice = Math.max(asFiniteNumber(totalPrice), 0);
    const safeLtv = Math.min(Math.max(Math.round(asFiniteNumber(ltv)), 0), 100);
    const downPaymentInTenThousands = Math.round(
        (safeTotalPrice / 10000) * (100 - safeLtv) / 100,
    );
    const downPayment = Math.min(downPaymentInTenThousands * 10000, safeTotalPrice);
    return {
        downPayment,
        loanAmount: safeTotalPrice - downPayment,
        ltv: safeLtv,
    };
}

export function calculateMonthlyPayment(principal, annualRate, years) {
    const amount = Math.max(asFiniteNumber(principal), 0);
    const months = Math.max(asFiniteNumber(years) * 12, 0);
    const monthlyRate = Math.max(asFiniteNumber(annualRate), 0) / 100 / 12;
    if (!amount || !months) return 0;
    if (!monthlyRate) return amount / months;
    return (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function calculateMonthlyPaymentWithGrace(
    principal,
    annualRate,
    years,
    graceYears = 0,
    elapsedMonths = 0,
) {
    const amount = Math.max(asFiniteNumber(principal), 0);
    const totalMonths = Math.max(Math.round(asFiniteNumber(years) * 12), 0);
    const elapsed = Math.max(Math.round(asFiniteNumber(elapsedMonths)), 0);
    if (!amount || !totalMonths || elapsed >= totalMonths) return 0;

    const graceMonths = Math.min(
        Math.max(Math.round(asFiniteNumber(graceYears) * 12), 0),
        Math.max(totalMonths - 12, 0),
    );
    const monthlyRate = Math.max(asFiniteNumber(annualRate), 0) / 100 / 12;
    if (elapsed < graceMonths) return amount * monthlyRate;
    return calculateMonthlyPayment(amount, annualRate, (totalMonths - graceMonths) / 12);
}

export function calculateTotalInterestWithGrace(principal, annualRate, years, graceYears = 0) {
    const amount = Math.max(asFiniteNumber(principal), 0);
    const totalMonths = Math.max(Math.round(asFiniteNumber(years) * 12), 0);
    if (!amount || !totalMonths) return 0;

    const graceMonths = Math.min(
        Math.max(Math.round(asFiniteNumber(graceYears) * 12), 0),
        Math.max(totalMonths - 12, 0),
    );
    const monthlyRate = Math.max(asFiniteNumber(annualRate), 0) / 100 / 12;
    const graceInterest = amount * monthlyRate * graceMonths;
    const repaymentMonths = totalMonths - graceMonths;
    const monthlyPayment = calculateMonthlyPayment(amount, annualRate, repaymentMonths / 12);
    return Math.max(graceInterest + monthlyPayment * repaymentMonths - amount, 0);
}

export function calculateYouthTotalInterest({
    principal,
    years,
    graceYears = 0,
    preferentialRate,
    originalRate,
}) {
    const amount = Math.max(asFiniteNumber(principal), 0);
    const totalMonths = Math.max(Math.round(asFiniteNumber(years) * 12), 0);
    if (!amount || !totalMonths) return 0;

    const graceMonths = Math.min(
        Math.max(Math.round(asFiniteNumber(graceYears) * 12), 0),
        Math.max(totalMonths - 12, 0),
    );
    const baseRate = Math.max(asFiniteNumber(preferentialRate), 0);
    const finalRate = Math.max(asFiniteNumber(originalRate), 0);
    const rateForMonth = (month) => {
        const year = Math.floor(month / 12) + 1;
        if (year <= 3) return baseRate;
        if (year === 4) return baseRate + 0.125;
        if (year === 5) return baseRate + 0.25;
        if (year === 6) return baseRate + 0.375;
        return finalRate;
    };

    let balance = amount;
    let totalInterest = 0;
    let monthlyPayment = 0;

    for (let month = 0; month < totalMonths && balance > 0; month += 1) {
        const annualRate = rateForMonth(month);
        const monthlyRate = annualRate / 100 / 12;
        const interest = balance * monthlyRate;
        totalInterest += interest;

        if (month < graceMonths) continue;
        if (month === graceMonths || month % 12 === 0) {
            monthlyPayment = calculateMonthlyPayment(balance, annualRate, (totalMonths - month) / 12);
        }
        const principalPayment = Math.min(Math.max(monthlyPayment - interest, 0), balance);
        balance -= principalPayment;
    }

    return Math.max(totalInterest, 0);
}

export function calculateRemainingBalance(principal, annualRate, monthlyAmount, paidMonths) {
    const amount = Math.max(asFiniteNumber(principal), 0);
    const rate = Math.max(asFiniteNumber(annualRate), 0) / 100 / 12;
    if (!rate) return Math.max(amount - monthlyAmount * paidMonths, 0);
    return Math.max(
        amount * Math.pow(1 + rate, paidMonths)
        - monthlyAmount * ((Math.pow(1 + rate, paidMonths) - 1) / rate),
        0,
    );
}

export function calculateYouthStages({
    youthAmount,
    youthYears,
    youthGraceYears = 0,
    preferentialRate,
    originalRate,
    generalMonthly = 0,
    generalAmount = 0,
    generalRate = 0,
    generalYears = 0,
    generalGraceYears = 0,
}) {
    const totalMonths = Math.max(asFiniteNumber(youthYears) * 12, 0);
    const baseRate = asFiniteNumber(preferentialRate);
    let balance = Math.max(asFiniteNumber(youthAmount), 0);
    const rates = [baseRate, baseRate, baseRate, baseRate + 0.125, baseRate + 0.25, baseRate + 0.375, asFiniteNumber(originalRate)];

    return rates.map((rate, index) => {
        const elapsedMonths = index * 12;
        const remainingMonths = Math.max(totalMonths - index * 12, 0);
        const graceMonths = Math.min(
            Math.max(Math.round(asFiniteNumber(youthGraceYears) * 12), 0),
            Math.max(totalMonths - 12, 0),
        );
        const youthMonthly = !remainingMonths
            ? 0
            : elapsedMonths < graceMonths
                ? balance * Math.max(asFiniteNumber(rate), 0) / 100 / 12
                : calculateMonthlyPayment(balance, rate, remainingMonths / 12);
        const currentGeneralMonthly = asFiniteNumber(generalAmount) > 0
            ? calculateMonthlyPaymentWithGrace(
                generalAmount,
                generalRate,
                generalYears,
                generalGraceYears,
                elapsedMonths,
            )
            : asFiniteNumber(generalMonthly);
        const stage = {
            year: index + 1,
            rate,
            totalMonthly: Math.round(youthMonthly + currentGeneralMonthly),
        };
        if (elapsedMonths >= graceMonths) {
            balance = calculateRemainingBalance(balance, rate, youthMonthly, Math.min(12, remainingMonths));
        }
        return stage;
    });
}

export function splitPayment(total, shareA, remainderRecipient = 'A') {
    const safeTotal = Math.round(Math.max(asFiniteNumber(total), 0));
    const safeShareA = Math.min(Math.max(asFiniteNumber(shareA), 0), 100);
    if (remainderRecipient === 'B') {
        const partyA = Math.floor(safeTotal * safeShareA / 100);
        return { partyA, partyB: safeTotal - partyA };
    }
    const partyB = Math.floor(safeTotal * (100 - safeShareA) / 100);
    return { partyA: safeTotal - partyB, partyB };
}

export function formatRate(value) {
    return asFiniteNumber(value).toFixed(3).replace(/\.?0+$/, '');
}
