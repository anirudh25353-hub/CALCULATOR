// =========================================
//   COLORFUL CALCULATOR — script.js
// =========================================

// ---------- State ----------
const state = {
  current:     '0',   // number being typed
  previous:    '',    // previous operand
  operator:    null,  // pending operator
  justEvaled:  false, // true right after pressing =
};

// ---------- DOM References ----------
const resultEl    = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const allButtons  = document.querySelectorAll('.btn');

// ---------- Update Display ----------
function updateDisplay() {
  resultEl.textContent = state.current;
  // Shrink font for long numbers
  resultEl.classList.toggle('small', state.current.length > 9);
}

function updateExpression(text) {
  expressionEl.textContent = text;
}

// ---------- Number Input ----------
function inputNumber(val) {
  // After equals, start fresh
  if (state.justEvaled) {
    state.current = val === '.' ? '0.' : val;
    state.justEvaled = false;
    updateDisplay();
    return;
  }

  // Prevent multiple dots
  if (val === '.' && state.current.includes('.')) return;

  // Replace leading zero only for digits (not dot)
  if (state.current === '0' && val !== '.') {
    state.current = val;
  } else {
    // Limit length to 12 chars
    if (state.current.replace('-', '').replace('.', '').length >= 12) return;
    state.current += val;
  }
  updateDisplay();
}

// ---------- Choose Operator ----------
function chooseOperator(op) {
  // If there's a pending op and user is still typing, evaluate first
  if (state.operator && !state.justEvaled) {
    calculate();
  }

  state.previous   = state.current;
  state.operator   = op;
  state.justEvaled = false;

  // Show expression hint: "12 +"
  updateExpression(`${state.previous} ${prettyOp(op)}`);

  // Mark the active operator button
  highlightOperator(op);

  // Prepare for next number input
  state.justEvaled = true; // reuse flag to reset current on next digit
}

// ---------- Calculate ----------
function calculate() {
  if (!state.operator || state.previous === '') return;

  const prev = parseFloat(state.previous);
  const curr = parseFloat(state.current);
  let result;

  switch (state.operator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) { result = 'Error'; break; }
      result = prev / curr;
      break;
    default: return;
  }

  // Show full expression in top line
  updateExpression(`${state.previous} ${prettyOp(state.operator)} ${state.current} =`);

  // Round to avoid floating-point noise (up to 10 decimal places)
  state.current  = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
  state.previous = '';
  state.operator = null;
  state.justEvaled = true;

  clearOperatorHighlight();
  updateDisplay();
}

// ---------- Clear ----------
function clear() {
  state.current    = '0';
  state.previous   = '';
  state.operator   = null;
  state.justEvaled = false;
  updateDisplay();
  updateExpression('');
  clearOperatorHighlight();
}

// ---------- Toggle Sign ----------
function toggleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

// ---------- Percent ----------
function percent() {
  if (state.current === 'Error') return;
  state.current = String(parseFloat(state.current) / 100);
  updateDisplay();
}

// ---------- Helpers ----------
function prettyOp(op) {
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op] || op;
}

function highlightOperator(op) {
  clearOperatorHighlight();
  document.querySelectorAll('.btn-operator').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active-op');
  });
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn-operator').forEach(btn =>
    btn.classList.remove('active-op')
  );
}

// ---------- Event Delegation ----------
allButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const { action, value } = btn.dataset;

    if (action === 'clear')   { clear();        return; }
    if (action === 'sign')    { toggleSign();   return; }
    if (action === 'percent') { percent();      return; }
    if (action === 'equals')  { calculate();    return; }

    if (['+', '-', '*', '/'].includes(value)) {
      chooseOperator(value);
      return;
    }

    // Digits and dot
    if (value !== undefined) inputNumber(value);
  });
});

// ---------- Keyboard Support ----------
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') { inputNumber(e.key); return; }
  if (e.key === '.')  { inputNumber('.');        return; }
  if (e.key === '+')  { chooseOperator('+');     return; }
  if (e.key === '-')  { chooseOperator('-');     return; }
  if (e.key === '*')  { chooseOperator('*');     return; }
  if (e.key === '/')  { e.preventDefault(); chooseOperator('/'); return; }
  if (e.key === 'Enter' || e.key === '=') { calculate(); return; }
  if (e.key === 'Escape') { clear(); return; }
  if (e.key === 'Backspace') {
    if (state.current.length > 1) {
      state.current = state.current.slice(0, -1);
    } else {
      state.current = '0';
    }
    updateDisplay();
  }
});

// ---------- Init ----------
updateDisplay();
