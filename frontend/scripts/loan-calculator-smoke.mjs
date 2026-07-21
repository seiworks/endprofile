import assert from 'node:assert/strict';
import {
    calculateMonthlyPayment, calculateYouthStages, formatRate, splitPayment,
} from '../src/services/loanCalculator.js';

assert.equal(formatRate(3.0), '3');
assert.equal(formatRate(2.010), '2.01');
assert.equal(formatRate(1.775), '1.775');
assert.deepEqual(splitPayment(1001, 50), { partyA: 501, partyB: 500 });
assert.deepEqual(splitPayment(1001, 50, 'B'), { partyA: 500, partyB: 501 });
assert.deepEqual(splitPayment(1000, 30), { partyA: 300, partyB: 700 });
assert.equal(Math.round(calculateMonthlyPayment(12000000, 0, 30)), 33333);

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

console.log('Loan calculator smoke check passed');
