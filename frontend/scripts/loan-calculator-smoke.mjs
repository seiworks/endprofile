import assert from 'node:assert/strict';
import {
    calculateLoanAmount, calculateLoanBreakdownFromLtv, calculateMonthlyPayment,
    calculateMonthlyPaymentWithGrace, calculateTotalInterestWithGrace, calculateYouthStages,
    calculateYouthTotalInterest, formatRate, splitPayment,
} from '../src/services/loanCalculator.js';

assert.equal(formatRate(3.0), '3');
assert.equal(formatRate(2.010), '2.01');
assert.equal(formatRate(1.775), '1.775');
assert.equal(calculateLoanAmount(17200000, 3440000), 13760000);
assert.equal(calculateLoanAmount(17200000, 20000000), 0);
assert.equal(calculateLoanAmount(null, -10000), 0);
assert.deepEqual(calculateLoanBreakdownFromLtv(18680000, 80), {
    downPayment: 3740000,
    loanAmount: 14940000,
    ltv: 80,
});
assert.deepEqual(calculateLoanBreakdownFromLtv(17200000, 80), {
    downPayment: 3440000,
    loanAmount: 13760000,
    ltv: 80,
});
assert.deepEqual(calculateLoanBreakdownFromLtv(18680000, 75), {
    downPayment: 4670000,
    loanAmount: 14010000,
    ltv: 75,
});
assert.deepEqual(splitPayment(1001, 50), { partyA: 501, partyB: 500 });
assert.deepEqual(splitPayment(1001, 50, 'B'), { partyA: 500, partyB: 501 });
assert.deepEqual(splitPayment(1000, 30), { partyA: 300, partyB: 700 });
assert.equal(Math.round(calculateMonthlyPayment(12000000, 0, 30)), 33333);
assert.equal(Math.round(calculateMonthlyPaymentWithGrace(12000000, 3, 30, 3)), 30000);
assert.equal(
    Math.round(calculateMonthlyPaymentWithGrace(12000000, 3, 30, 3, 36)),
    Math.round(calculateMonthlyPayment(12000000, 3, 27)),
);
assert.equal(calculateTotalInterestWithGrace(12000000, 0, 30, 3), 0);
assert.ok(calculateTotalInterestWithGrace(12000000, 3, 30, 3) > 0);
assert.ok(
    calculateTotalInterestWithGrace(12000000, 3, 30, 3)
    > calculateTotalInterestWithGrace(12000000, 3, 30, 0),
);
assert.ok(calculateYouthTotalInterest({
    principal: 10000000,
    years: 40,
    graceYears: 5,
    preferentialRate: 1.775,
    originalRate: 2.275,
}) > 0);

const stages = calculateYouthStages({
    youthAmount: 10000000,
    youthYears: 40,
    preferentialRate: 1.775,
    originalRate: 2.275,
    generalMonthly: 12000,
});
assert.deepEqual(stages.map((stage) => stage.rate), [1.775, 1.775, 1.775, 1.9, 2.025, 2.15, 2.275]);
assert.equal(stages[0].year, 1);
assert.equal(stages[6].year, 7);
assert.ok(stages[6].totalMonthly > stages[0].totalMonthly);

const graceStages = calculateYouthStages({
    youthAmount: 10000000,
    youthYears: 40,
    youthGraceYears: 5,
    preferentialRate: 1.775,
    originalRate: 2.275,
    generalAmount: 2000000,
    generalRate: 3,
    generalYears: 30,
    generalGraceYears: 3,
});
assert.equal(graceStages[0].totalMonthly, Math.round(10000000 * 0.01775 / 12 + 2000000 * 0.03 / 12));
assert.ok(graceStages[5].totalMonthly > graceStages[0].totalMonthly);

console.log('Loan calculator smoke check passed');
