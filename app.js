const SAMPLE_NEWS_SCRIPT = `SLUG - "OPENING"

GOOD EVENING. WELCOME TO AHASATV SEVEN O'CLOCK BROADCAST.

SLUG - "TOP STORY"

TOP STORY TONIGHT: A HISTORIC SCIENTIFIC BREAKTHROUGH HAS BEEN ANNOUNCED THIS AFTERNOON BY RESEARCHERS AT THE INTERNATIONAL QUANTUM ALLIANCE. 

AFTER MORE THAN FIVE YEARS OF HIGH-PRECISION EXPERIMENTS, SCIENTISTS HAVE CONFIRMED A STABLE ROOM-TEMPERATURE SUPERCONDUCTOR CAPABLE OF TRANSMITTING ELECTRICAL CURRENT WITH ZERO RESISTANCE.

INDUSTRY LEADERS ESTIMATE THIS DISCOVERY COULD CUT GLOBAL ENERGY TRANSMISSION LOSSES BY NEARLY THIRTY PERCENT OVER THE NEXT DECADE.

SLUG - "MARKETS"

TURNING TO ECONOMIC NEWS: FINANCIAL MARKETS EXPERIENCED A SHARP RALLY TODAY IN RESPONSE TO THE BREAKTHROUGH. BENCHMARK INDICES SURGED ACROSS EUROPE AND ASIA, CULMINATING IN RECORD-SETTING CLOSING HIGHS.

SLUG - "DOMESTIC"

IN DOMESTIC AFFAIRS, TRANSPORTATION OFFICIALS HAVE FINALIZED THE UPGRADE SCHEDULE FOR THE HIGH-SPEED RAILWAY EXPANSION. COMMUTERS CAN EXPECT EXPANDED INTERCITY SERVICE STARTING EARLY NEXT SPRING.

SLUG - "TEASE"

COMING UP AFTER THE BREAK: OUR IN-DEPTH REPORT ON HOW AUTOMATED DRONE DELIVERY IS TRANSFORMING EMERGENCY HEALTHCARE IN REMOTE REGIONS. 

STAY WITH US. MORE NEWS RIGHT AFTER THESE MESSAGES.`;

const state = {
  isRunning: false,
  mode: 'toggle',
  speed: 2.4,
  direction: 1,
  scrollPos: 0,
  maxScroll: 0,
  lastTimestamp: null,
  isHolding: false,
  mirrorX: false,
  mirrorY: false,
  fontFamily: "'Inter', sans-serif",
  fontSize: 58,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'left',
  columnWidth: 68,
  eyelinePos: 35,
  guideVisible: true,
  fontColor: '#ffffff',
  bgColor: '#060709',
  focusMask: false,
  hudHidden: false,
  elapsedSeconds: 0,
  timerInterval: null,
  words: [],
  wpm: 0,
  hudTimeout: null,
  sections: [],          // parsed SLUG sections: [{name, scrollY, index}]
  activeSectionIndex: -1, // currently active section index
  editorSectionIndex: -1,
  keyBindings: {
    playPause: '',
    nextSlug: '',
    backSlug: ''
  },
  capturingKeyAction: null,
  activeGamepadInputs: new Set(),
  activeControllerHoldInput: null
};

const dom = {
  studioSplash: document.getElementById('studioSplash'),
  studioHud: document.getElementById('studioHud'),
  controlDock: document.getElementById('controlDock'),
  hudShowTab: document.getElementById('hudShowTab'),
  btnRestoreDock: document.getElementById('btnRestoreDock'),
  btnDockMinimize: document.getElementById('btnDockMinimize'),
  viewport: document.getElementById('prompterViewport'),
  content: document.getElementById('prompterContent'),
  display: document.getElementById('scriptDisplay'),
  topSpacer: document.getElementById('scriptSpacerTop'),
  bottomSpacer: document.getElementById('scriptSpacerBottom'),
  tallyBox: document.getElementById('tallyBox'),
  tallyLabel: document.getElementById('tallyLabel'),
  elapsedTimer: document.getElementById('elapsedTimer'),
  remainingTimer: document.getElementById('remainingTimer'),
  wpmCounter: document.getElementById('wpmCounter'),
  btnPrimaryAction: document.getElementById('btnPrimaryAction'),
  primaryIconPlay: document.getElementById('primaryIconPlay'),
  primaryIconPause: document.getElementById('primaryIconPause'),
  primaryActionLabel: document.getElementById('primaryActionLabel'),
  btnRewind: document.getElementById('btnRewind'),
  modeToggleBtn: document.getElementById('modeToggleBtn'),
  modeActiveBtn: document.getElementById('modeActiveBtn'),
  speedSlider: document.getElementById('speedSlider'),
  speedDisplay: document.getElementById('speedDisplay'),
  btnSpeedDown: document.getElementById('btnSpeedDown'),
  btnSpeedUp: document.getElementById('btnSpeedUp'),
  editorFileInput: document.getElementById('editorFileInput'),
  btnFlipH: document.getElementById('btnFlipH'),
  btnFlipV: document.getElementById('btnFlipV'),
  btnFullscreen: document.getElementById('btnFullscreen'),
  fullscreenIcon: document.getElementById('fullscreenIcon'),
  focusVignette: document.getElementById('focusVignette'),
  eyelineGuide: document.getElementById('eyelineGuide'),
  toggleEyelineCue: document.getElementById('toggleEyelineCue'),
  btnSettingsToggle: document.getElementById('btnSettingsToggle'),
  settingsDrawer: document.getElementById('settingsDrawer'),
  btnCloseDrawer: document.getElementById('btnCloseDrawer'),
  btnQuickEdit: document.getElementById('btnQuickEdit'),
  scriptEditorDrawer: document.getElementById('scriptEditorDrawer'),
  btnCloseEditor: document.getElementById('btnCloseEditor'),
  scriptTextarea: document.getElementById('scriptTextarea'),
  btnApplyScript: document.getElementById('btnApplyScript'),
  btnClearScript: document.getElementById('btnClearScript'),
  btnLoadSampleScript: document.getElementById('btnLoadSampleScript'),
  scriptWordCount: document.getElementById('scriptWordCount'),
  scriptCharCount: document.getElementById('scriptCharCount'),
  fontFamilySelect: document.getElementById('fontFamilySelect'),
  alignButtons: document.querySelectorAll('.align-btn'),
  fontSizeSlider: document.getElementById('fontSizeSlider'),
  fontSizeValue: document.getElementById('fontSizeValue'),
  lineHeightSlider: document.getElementById('lineHeightSlider'),
  lineHeightValue: document.getElementById('lineHeightValue'),
  letterSpacingSlider: document.getElementById('letterSpacingSlider'),
  letterSpacingValue: document.getElementById('letterSpacingValue'),
  columnWidthSlider: document.getElementById('columnWidthSlider'),
  columnWidthValue: document.getElementById('columnWidthValue'),
  eyelinePosSlider: document.getElementById('eyelinePosSlider'),
  eyelinePosValue: document.getElementById('eyelinePosValue'),
  toggleFocusMask: document.getElementById('toggleFocusMask'),
  toggleReverse: document.getElementById('toggleReverse'),
  fontColorPicker: document.getElementById('fontColorPicker'),
  fontColorHex: document.getElementById('fontColorHex'),
  bgColorPicker: document.getElementById('bgColorPicker'),
  bgColorHex: document.getElementById('bgColorHex'),
  fontSwatches: document.querySelectorAll('.font-swatch'),
  bgSwatches: document.querySelectorAll('.bg-swatch'),
  btnSectionsToggle: document.getElementById('btnSectionsToggle'),
  sectionsPanel: document.getElementById('sectionsPanel'),
  btnInsertSlug: document.getElementById('btnInsertSlug'),
  sectionsList: document.getElementById('sectionsList'),
  sectionCount: document.getElementById('sectionCount'),
  keymapBindButtons: document.querySelectorAll('[data-key-action]'),
  keymapClearButtons: document.querySelectorAll('[data-clear-key-action]')
};

function initSplashScreen() {
  if (!dom.studioSplash) return;
  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    dom.studioSplash.classList.add('reveal');
    setTimeout(() => {
      if (dom.studioSplash && dom.studioSplash.parentNode) {
        dom.studioSplash.parentNode.removeChild(dom.studioSplash);
      }
    }, 950);
  }

  const timer = setTimeout(dismiss, 3800);

  dom.studioSplash.addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });

  function handleKey() {
    clearTimeout(timer);
    dismiss();
    window.removeEventListener('keydown', handleKey);
  }
  window.addEventListener('keydown', handleKey, { once: true });
}

function init() {
  initSplashScreen();
  loadStoredPreferences();
  setScriptText(SAMPLE_NEWS_SCRIPT);
  applyTypography();
  applyColors();
  applyGeometry();
  updateSpeedUI();
  updateModeUI();
  updateKeyMappingUI();
  setupEventListeners();
  requestAnimationFrame(animationLoop);
  resetHudAutoHideTimer();
}

function loadStoredPreferences() {
  try {
    const raw = localStorage.getItem('ahasatv_prompter_config');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.speed) state.speed = Number(saved.speed);
    if (saved.fontFamily) state.fontFamily = saved.fontFamily;
    if (saved.fontSize) state.fontSize = Number(saved.fontSize);
    if (saved.lineHeight) state.lineHeight = Number(saved.lineHeight);
    if (saved.letterSpacing) state.letterSpacing = Number(saved.letterSpacing);
    if (saved.textAlign) state.textAlign = saved.textAlign;
    if (saved.columnWidth) state.columnWidth = Number(saved.columnWidth);
    if (saved.eyelinePos) state.eyelinePos = Number(saved.eyelinePos);
    if (typeof saved.guideVisible === 'boolean') state.guideVisible = saved.guideVisible;
    if (saved.fontColor) state.fontColor = saved.fontColor;
    if (saved.bgColor) state.bgColor = saved.bgColor;
    if (saved.mode) state.mode = saved.mode;
    if (typeof saved.mirrorX === 'boolean') state.mirrorX = saved.mirrorX;
    if (typeof saved.mirrorY === 'boolean') state.mirrorY = saved.mirrorY;
    if (typeof saved.focusMask === 'boolean') state.focusMask = saved.focusMask;
    if (saved.keyBindings && typeof saved.keyBindings === 'object') {
      Object.keys(state.keyBindings).forEach((action) => {
        if (typeof saved.keyBindings[action] === 'string') state.keyBindings[action] = saved.keyBindings[action];
      });
    }
  } catch (e) {}
}

function savePreferences() {
  try {
    const data = {
      speed: state.speed,
      fontFamily: state.fontFamily,
      fontSize: state.fontSize,
      lineHeight: state.lineHeight,
      letterSpacing: state.letterSpacing,
      textAlign: state.textAlign,
      columnWidth: state.columnWidth,
      eyelinePos: state.eyelinePos,
      guideVisible: state.guideVisible,
      fontColor: state.fontColor,
      bgColor: state.bgColor,
      mode: state.mode,
      mirrorX: state.mirrorX,
      mirrorY: state.mirrorY,
      focusMask: state.focusMask,
      keyBindings: state.keyBindings
    };
    localStorage.setItem('ahasatv_prompter_config', JSON.stringify(data));
  } catch (e) {}
}

function formatKeyCode(code) {
  if (code.startsWith('gamepad:button:')) {
    const button = Number(code.split(':')[2]);
    const labels = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'Left Stick', 'Right Stick', 'D-pad Up', 'D-pad Down', 'D-pad Left', 'D-pad Right', 'Xbox'];
    return labels[button] || `Button ${button + 1}`;
  }
  if (code.startsWith('gamepad:axis:')) {
    const [, , axis, direction] = code.split(':');
    const stick = Number(axis) === 0 || Number(axis) === 1 ? 'Left Stick' : 'Right Stick';
    const isHorizontal = Number(axis) % 2 === 0;
    return `${stick} ${isHorizontal ? (direction === '-1' ? 'Left' : 'Right') : (direction === '-1' ? 'Up' : 'Down')}`;
  }
  const labels = {
    Space: 'Space', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
    Escape: 'Esc', Enter: 'Enter', Backspace: 'Backspace', Tab: 'Tab',
    BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '='
  };
  if (labels[code]) return labels[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^Numpad\d$/.test(code)) return `Num ${code.slice(6)}`;
  return code.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function updateKeyMappingUI() {
  dom.keymapBindButtons.forEach((button) => {
    const action = button.dataset.keyAction;
    const isCapturing = state.capturingKeyAction === action;
    button.classList.toggle('is-listening', isCapturing);
    button.querySelector('kbd').textContent = isCapturing ? 'Press a key…' : (state.keyBindings[action] ? formatKeyCode(state.keyBindings[action]) : 'Not set');
    button.querySelector('span').textContent = isCapturing ? 'Listening' : 'Map key';
  });
}

function runMappedAction(action, input = null) {
  if (action === 'playPause') {
    if (state.mode === 'active') {
      state.isHolding = true;
      state.activeControllerHoldInput = input;
      setRunningState(true);
    } else {
      state.isHolding = false;
      setRunningState(!state.isRunning);
    }
  } else if (action === 'nextSlug') {
    jumpSectionRelative(1);
  } else if (action === 'backSlug') {
    jumpSectionRelative(-1);
  }
}

function getGamepadInputs(gamepad) {
  const inputs = new Set();
  gamepad.buttons.forEach((button, index) => {
    if (button.pressed || button.value >= 0.65) inputs.add(`gamepad:button:${index}`);
  });
  gamepad.axes.forEach((value, index) => {
    if (value <= -0.7) inputs.add(`gamepad:axis:${index}:-1`);
    if (value >= 0.7) inputs.add(`gamepad:axis:${index}:1`);
  });
  return inputs;
}

function pollGamepadInput() {
  if (!navigator.getGamepads) return;
  const activeInputs = new Set();
  Array.from(navigator.getGamepads()).filter(Boolean).forEach((gamepad) => {
    getGamepadInputs(gamepad).forEach((input) => activeInputs.add(input));
  });

  const newlyPressed = [...activeInputs].filter((input) => !state.activeGamepadInputs.has(input));
  const releasedInputs = [...state.activeGamepadInputs].filter((input) => !activeInputs.has(input));
  state.activeGamepadInputs = activeInputs;

  if (state.mode === 'active' && state.activeControllerHoldInput && releasedInputs.includes(state.activeControllerHoldInput)) {
    state.isHolding = false;
    state.activeControllerHoldInput = null;
    setRunningState(false);
  }

  if (!newlyPressed.length) return;

  if (state.capturingKeyAction) {
    state.keyBindings[state.capturingKeyAction] = newlyPressed[0];
    state.capturingKeyAction = null;
    updateKeyMappingUI();
    savePreferences();
    return;
  }

  const mappedAction = Object.keys(state.keyBindings).find((action) => newlyPressed.includes(state.keyBindings[action]));
  if (mappedAction) runMappedAction(mappedAction, state.keyBindings[mappedAction]);
}

function setScriptText(text) {
  const clean = text.trim() ? text : 'Click SCRIPT to paste or load your script.';
  dom.display.innerText = clean;
  dom.scriptTextarea.value = clean;
  updateScriptMetrics(clean);
  calculateMaxScroll();
  // Parse sections after DOM has rendered so we can measure scroll positions
  requestAnimationFrame(() => requestAnimationFrame(() => parseSections()));
}

function updateScriptMetrics(text) {
  const words = text.match(/\S+/g) || [];
  state.words = words;
  dom.scriptWordCount.innerText = `${words.length} Words`;
  dom.scriptCharCount.innerText = `${text.length} Chars`;
  renderEditorSections();
}

// ── SECTION NAVIGATION ─────────────────────────────────────────────────────

const SLUG_LINE_REGEX = /^\s*SLUG\s*-\s*["\u201c\u201d](.+?)["\u201c\u201d]\s*$/i;

function extractSlugMatches(text) {
  const lines = text.split('\n');
  const matches = [];
  let charOffset = 0;
  lines.forEach((line, lineIndex) => {
    const match = SLUG_LINE_REGEX.exec(line);
    if (match) {
      matches.push({
        name: match[1].trim(),
        lineIndex,
        charOffset,
        line
      });
    }
    charOffset += line.length + 1;
  });
  return matches;
}

function parseSections() {
  state.sections = [];
  state.activeSectionIndex = -1;

  const displayEl = dom.display;
  const walker = document.createTreeWalker(displayEl, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  const nodeMap = [];
  let pos = 0;
  for (const tn of textNodes) {
    nodeMap.push({ node: tn, start: pos, end: pos + tn.length });
    pos += tn.length;
  }

  extractSlugMatches(displayEl.innerText).forEach((slug) => {
    state.sections.push({
      name: slug.name,
      scrollY: getScrollYForCharOffset(slug.charOffset, nodeMap),
      lineIndex: slug.lineIndex
    });
  });

  renderEditorSections();
}

function getScrollYForCharOffset(charOffset, nodeMap) {
  // Find which text node contains this offset
  for (const entry of nodeMap) {
    if (charOffset >= entry.start && charOffset <= entry.end) {
      try {
        const range = document.createRange();
        const localOffset = charOffset - entry.start;
        range.setStart(entry.node, Math.min(localOffset, entry.node.length));
        range.setEnd(entry.node, Math.min(localOffset, entry.node.length));
        const rect = range.getBoundingClientRect();
        const viewportRect = dom.viewport.getBoundingClientRect();
        // scrollY = current scroll + element offset relative to viewport top
        return dom.viewport.scrollTop + (rect.top - viewportRect.top);
      } catch (e) {
        return 0;
      }
    }
  }
  return 0;
}

function renderEditorSections() {
  const slugs = extractSlugMatches(dom.scriptTextarea.value);
  const count = slugs.length;
  dom.sectionCount.textContent = count;
  dom.sectionCount.classList.toggle('hidden', false);
  dom.sectionsList.innerHTML = '';

  if (count === 0) {
    state.editorSectionIndex = -1;
    dom.sectionsList.innerHTML = '<div class="sections-empty">No SLUG sections detected. Use Insert SLUG or write: SLUG - "NAME"</div>';
    return;
  }

  if (state.editorSectionIndex >= count) state.editorSectionIndex = -1;

  slugs.forEach((section, idx) => {
    const row = document.createElement('div');
    row.className = 'section-item';
    if (idx === state.editorSectionIndex) row.classList.add('active');
    row.dataset.index = idx;
    row.innerHTML = `
      <span class="section-item-num">${String(idx + 1).padStart(2, '0')}</span>
      <span class="section-item-name">${escapeHtml(section.name)}</span>
      <div class="section-item-actions">
        <button type="button" class="section-item-action" data-action="jump" title="Jump on prompter">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <button type="button" class="section-item-action danger" data-action="remove" title="Remove SLUG line">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path></svg>
        </button>
      </div>
    `;
    row.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'jump') {
        e.stopPropagation();
        jumpToSectionByName(section.name);
        return;
      }
      if (action === 'remove') {
        e.stopPropagation();
        removeEditorSection(idx);
        return;
      }
      focusEditorSection(idx);
    });
    dom.sectionsList.appendChild(row);
  });
}

function setSectionsPanelOpen(open) {
  dom.sectionsPanel.classList.toggle('hidden', !open);
  dom.btnSectionsToggle.classList.toggle('active', open);
}

function focusEditorSection(index) {
  const slugs = extractSlugMatches(dom.scriptTextarea.value);
  const section = slugs[index];
  if (!section) return;
  state.editorSectionIndex = index;
  const ta = dom.scriptTextarea;
  const end = section.charOffset + section.line.length;
  ta.focus();
  ta.setSelectionRange(section.charOffset, end);
  const styles = getComputedStyle(ta);
  const lineHeight = parseFloat(styles.lineHeight) || 24;
  ta.scrollTop = Math.max(0, section.lineIndex * lineHeight - 48);
  renderEditorSections();
}

function insertSlugAtCursor() {
  const ta = dom.scriptTextarea;
  const value = ta.value;
  const start = ta.selectionStart;
  const after = value.slice(ta.selectionEnd);
  const before = value.slice(0, start);
  const needsLead = before.length > 0 && !before.endsWith('\n');
  const needsTrail = after.length > 0 && !after.startsWith('\n');
  const placeholder = 'SECTION NAME';
  const slug = `${needsLead ? '\n' : ''}SLUG - "${placeholder}"${needsTrail ? '\n' : ''}`;
  ta.value = before + slug + after;
  const nameStart = (before + (needsLead ? '\n' : '') + 'SLUG - "').length;
  ta.focus();
  ta.setSelectionRange(nameStart, nameStart + placeholder.length);
  updateScriptMetrics(ta.value);
  setSectionsPanelOpen(true);
  const slugs = extractSlugMatches(ta.value);
  const insertedIndex = slugs.findIndex((s) => s.charOffset === nameStart - 'SLUG - "'.length);
  state.editorSectionIndex = insertedIndex >= 0 ? insertedIndex : slugs.length - 1;
  renderEditorSections();
}

function removeEditorSection(index) {
  const ta = dom.scriptTextarea;
  const slugs = extractSlugMatches(ta.value);
  const section = slugs[index];
  if (!section) return;
  const value = ta.value;
  let from = section.charOffset;
  let to = section.charOffset + section.line.length;
  if (value[to] === '\n') to += 1;
  else if (from > 0 && value[from - 1] === '\n') from -= 1;
  ta.value = value.slice(0, from) + value.slice(to);
  state.editorSectionIndex = -1;
  updateScriptMetrics(ta.value);
}

function jumpToSectionByName(name) {
  const idx = state.sections.findIndex((s) => s.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) {
    showSectionToast('Apply script to jump on air', -1);
    return;
  }
  jumpToSection(idx);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function jumpToSection(index) {
  if (index < 0 || index >= state.sections.length) return;
  state.activeSectionIndex = index;
  const section = state.sections[index];

  // Scroll the prompter viewport to the section
  dom.viewport.scrollTo({ top: Math.max(0, section.scrollY - 40), behavior: 'smooth' });
  state.scrollPos = Math.max(0, section.scrollY - 40);

  // Pause scrolling on jump so presenter can orient
  if (state.isRunning) setRunningState(false);

  updateActiveSectionUI();

  // Show a brief toast label
  showSectionToast(section.name, index);
}

function jumpSectionRelative(delta) {
  if (state.sections.length === 0) return;

  // If no active section yet, determine which one we're nearest to based on scroll
  if (state.activeSectionIndex === -1) {
    const currentScroll = dom.viewport.scrollTop;
    let nearest = 0;
    for (let i = 0; i < state.sections.length; i++) {
      if (state.sections[i].scrollY <= currentScroll + 50) nearest = i;
    }
    state.activeSectionIndex = nearest;
  }

  const next = state.activeSectionIndex + delta;
  const clamped = Math.max(0, Math.min(state.sections.length - 1, next));
  jumpToSection(clamped);
}

function updateActiveSectionUI() {
  const active = state.sections[state.activeSectionIndex];
  const activeName = active ? active.name.toLowerCase() : '';
  const slugs = extractSlugMatches(dom.scriptTextarea.value);
  dom.sectionsList.querySelectorAll('.section-item').forEach((row, idx) => {
    const match = slugs[idx] && slugs[idx].name.toLowerCase() === activeName;
    row.classList.toggle('active', match);
  });
}

function showSectionToast(name, index) {
  let toast = document.getElementById('sectionToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sectionToast';
    toast.className = 'section-toast';
    document.body.appendChild(toast);
  }
  const num = index >= 0 ? `<span class="toast-num">§${index + 1}</span>` : '';
  toast.innerHTML = `${num}<span class="toast-name">${escapeHtml(name)}</span>`;
  toast.classList.add('visible');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

// ── END SECTION NAVIGATION ──────────────────────────────────────────────────

function calculateMaxScroll() {
  requestAnimationFrame(() => {
    state.maxScroll = Math.max(0, dom.viewport.scrollHeight - dom.viewport.clientHeight);
  });
}

function applyTypography() {
  document.documentElement.style.setProperty('--font-family', state.fontFamily);
  document.documentElement.style.setProperty('--font-size', `${state.fontSize}px`);
  document.documentElement.style.setProperty('--line-height', state.lineHeight);
  document.documentElement.style.setProperty('--letter-spacing', `${state.letterSpacing}px`);
  document.documentElement.style.setProperty('--text-align', state.textAlign);

  dom.fontFamilySelect.value = state.fontFamily;
  dom.fontSizeSlider.value = state.fontSize;
  dom.fontSizeValue.innerText = `${state.fontSize}px`;
  dom.lineHeightSlider.value = state.lineHeight;
  dom.lineHeightValue.innerText = `${state.lineHeight}x`;
  dom.letterSpacingSlider.value = state.letterSpacing;
  dom.letterSpacingValue.innerText = `${state.letterSpacing}px`;

  dom.alignButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === state.textAlign);
  });

  calculateMaxScroll();
}

function applyColors() {
  document.documentElement.style.setProperty('--text-color', state.fontColor);
  document.documentElement.style.setProperty('--bg-color', state.bgColor);

  dom.fontColorPicker.value = state.fontColor;
  dom.fontColorHex.innerText = state.fontColor.toUpperCase();
  dom.bgColorPicker.value = state.bgColor;
  dom.bgColorHex.innerText = state.bgColor.toUpperCase();

  dom.fontSwatches.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color.toLowerCase() === state.fontColor.toLowerCase());
  });

  dom.bgSwatches.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bgcolor.toLowerCase() === state.bgColor.toLowerCase());
  });
}

function applyGeometry() {
  document.documentElement.style.setProperty('--column-width', `${state.columnWidth}%`);
  document.documentElement.style.setProperty('--eyeline-pos', `${state.eyelinePos}%`);

  dom.columnWidthSlider.value = state.columnWidth;
  dom.columnWidthValue.innerText = `${state.columnWidth}%`;
  dom.eyelinePosSlider.value = state.eyelinePos;
  dom.eyelinePosValue.innerText = `${state.eyelinePos}%`;

  dom.toggleEyelineCue.checked = state.guideVisible;
  dom.eyelineGuide.classList.toggle('hidden', !state.guideVisible);

  dom.toggleFocusMask.checked = state.focusMask;
  if (state.focusMask) {
    dom.focusVignette.classList.remove('hidden');
  } else {
    dom.focusVignette.classList.add('hidden');
  }

  applyMirrorClasses();
  calculateMaxScroll();
}

function applyMirrorClasses() {
  dom.content.classList.toggle('mirror-x', state.mirrorX);
  dom.content.classList.toggle('mirror-y', state.mirrorY);
  dom.btnFlipH.classList.toggle('active', state.mirrorX);
  dom.btnFlipV.classList.toggle('active', state.mirrorY);
}

function updateSpeedUI() {
  dom.speedSlider.value = state.speed;
  dom.speedDisplay.innerHTML = `${state.speed.toFixed(1)}<small>px/f</small>`;
}

function updateModeUI() {
  if (state.mode === 'toggle') {
    dom.modeToggleBtn.classList.add('active');
    dom.modeActiveBtn.classList.remove('active');
    dom.btnPrimaryAction.classList.remove('active-mode-style');
    dom.primaryActionLabel.innerText = state.isRunning ? 'PAUSE' : 'START';
  } else {
    dom.modeActiveBtn.classList.add('active');
    dom.modeToggleBtn.classList.remove('active');
    dom.btnPrimaryAction.classList.add('active-mode-style');
    dom.primaryActionLabel.innerText = 'HOLD ROLL';
  }
}

function setRunningState(running) {
  state.isRunning = running;

  if (running) {
    hideHud();
    dom.tallyBox.classList.add('on-air');
    dom.tallyLabel.innerText = 'ON AIR';
    dom.btnPrimaryAction.classList.add('is-running');
    dom.primaryIconPlay.classList.add('hidden');
    dom.primaryIconPause.classList.remove('hidden');
    if (state.mode === 'toggle') dom.primaryActionLabel.innerText = 'PAUSE';

    if (!state.timerInterval) {
      state.timerInterval = setInterval(() => {
        state.elapsedSeconds++;
        updateTimerDisplay();
      }, 1000);
    }
  } else {
    showHud();
    dom.tallyBox.classList.remove('on-air');
    dom.tallyLabel.innerText = 'STANDBY';
    dom.btnPrimaryAction.classList.remove('is-running');
    dom.primaryIconPause.classList.add('hidden');
    dom.primaryIconPlay.classList.remove('hidden');
    if (state.mode === 'toggle') dom.primaryActionLabel.innerText = 'START';

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }
}

function updateTimerDisplay() {
  const h = String(Math.floor(state.elapsedSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((state.elapsedSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(state.elapsedSeconds % 60).padStart(2, '0');
  dom.elapsedTimer.innerText = `${h}:${m}:${s}`;
}

function animationLoop(timestamp) {
  pollGamepadInput();
  if (!state.lastTimestamp) state.lastTimestamp = timestamp;
  const delta = Math.min((timestamp - state.lastTimestamp) / 16.666, 3);
  state.lastTimestamp = timestamp;

  if (state.isRunning) {
    const step = state.speed * state.direction * delta;
    state.scrollPos += step;

    if (state.scrollPos < 0) {
      state.scrollPos = 0;
      setRunningState(false);
    } else if (state.scrollPos >= state.maxScroll && state.maxScroll > 0) {
      state.scrollPos = state.maxScroll;
      setRunningState(false);
    }

    dom.viewport.scrollTop = state.scrollPos;
    computeTelemetry();
  } else {
    state.scrollPos = dom.viewport.scrollTop;
  }

  requestAnimationFrame(animationLoop);
}

function computeTelemetry() {
  const ratio = state.maxScroll > 0 ? state.scrollPos / state.maxScroll : 0;
  const totalWords = state.words.length;
  if (totalWords === 0) return;

  const wordsRead = Math.round(ratio * totalWords);
  const wordsLeft = totalWords - wordsRead;

  const pxPerSecond = state.speed * 60;
  const charsPerLine = Math.max(20, Math.floor(dom.content.clientWidth / (state.fontSize * 0.55)));
  const pxPerLine = state.fontSize * state.lineHeight;
  const linesPerSecond = pxPerSecond / pxPerLine;
  const wordsPerLine = charsPerLine / 5.2;
  const currentWpm = Math.max(20, Math.round(linesPerSecond * wordsPerLine * 60));

  state.wpm = currentWpm;
  dom.wpmCounter.innerText = currentWpm;

  const secondsLeft = Math.round((wordsLeft / currentWpm) * 60);
  if (secondsLeft > 0 && secondsLeft < 86400) {
    const remM = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const remS = String(secondsLeft % 60).padStart(2, '0');
    dom.remainingTimer.innerText = `${remM}:${remS}`;
  } else {
    dom.remainingTimer.innerText = '00:00';
  }
}

function rewindToTop() {
  state.scrollPos = 0;
  dom.viewport.scrollTop = 0;
  computeTelemetry();
}

function resetHudAutoHideTimer() {
  if (state.hudHidden) {
    showHud();
  }
  clearTimeout(state.hudTimeout);
  if (state.isRunning) {
    state.hudTimeout = setTimeout(() => {
      hideHud();
    }, 2000);
  }
}

function hideHud() {
  if (dom.settingsDrawer.classList.contains('hidden') && dom.scriptEditorDrawer.classList.contains('hidden')) {
    state.hudHidden = true;
    dom.studioHud.classList.add('hud-hidden');
    dom.controlDock.classList.add('dock-hidden');
    dom.hudShowTab.classList.remove('hidden');
  }
}

function showHud() {
  state.hudHidden = false;
  dom.studioHud.classList.remove('hud-hidden');
  dom.controlDock.classList.remove('dock-hidden');
  dom.hudShowTab.classList.add('hidden');
}

function toggleFullscreen() {
  if (window.pywebview && window.pywebview.api && window.pywebview.api.toggle_fullscreen) {
    window.pywebview.api.toggle_fullscreen();
  } else if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function handleFileInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    setScriptText(event.target.result);
    rewindToTop();
  };
  reader.readAsText(file);
}

function setupEventListeners() {
  window.addEventListener('resize', calculateMaxScroll);

  dom.btnPrimaryAction.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.mode === 'toggle') {
      setRunningState(!state.isRunning);
    }
  });

  dom.keymapBindButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.capturingKeyAction = button.dataset.keyAction;
      updateKeyMappingUI();
    });
  });

  dom.keymapClearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.clearKeyAction;
      state.keyBindings[action] = '';
      if (state.capturingKeyAction === action) state.capturingKeyAction = null;
      updateKeyMappingUI();
      savePreferences();
    });
  });

  dom.btnPrimaryAction.addEventListener('mousedown', (e) => {
    if (state.mode === 'active') {
      e.preventDefault();
      state.isHolding = true;
      setRunningState(true);
    }
  });

  window.addEventListener('mouseup', () => {
    if (state.mode === 'active' && state.isHolding) {
      state.isHolding = false;
      setRunningState(false);
    }
  });

  dom.viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('#controlDock') || e.target.closest('#studioHud') || e.target.closest('aside')) return;
    if (state.mode === 'active') {
      state.isHolding = true;
      setRunningState(true);
    } else {
      setRunningState(!state.isRunning);
    }
  });

  dom.viewport.addEventListener('touchstart', (e) => {
    if (e.target.closest('#controlDock') || e.target.closest('#studioHud') || e.target.closest('aside')) return;
    if (state.mode === 'active') {
      state.isHolding = true;
      setRunningState(true);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (state.mode === 'active' && state.isHolding) {
      state.isHolding = false;
      setRunningState(false);
    }
  });

  dom.modeToggleBtn.addEventListener('click', () => {
    state.mode = 'toggle';
    setRunningState(false);
    updateModeUI();
    savePreferences();
  });

  dom.modeActiveBtn.addEventListener('click', () => {
    state.mode = 'active';
    setRunningState(false);
    updateModeUI();
    savePreferences();
  });

  dom.speedSlider.addEventListener('input', (e) => {
    state.speed = parseFloat(e.target.value);
    updateSpeedUI();
    savePreferences();
  });

  dom.btnSpeedDown.addEventListener('click', () => {
    state.speed = Math.max(0.2, Number((state.speed - 0.4).toFixed(1)));
    updateSpeedUI();
    savePreferences();
  });

  dom.btnSpeedUp.addEventListener('click', () => {
    state.speed = Math.min(25, Number((state.speed + 0.4).toFixed(1)));
    updateSpeedUI();
    savePreferences();
  });

  dom.btnRewind.addEventListener('click', rewindToTop);

  dom.editorFileInput.addEventListener('change', handleFileInput);

  dom.btnSectionsToggle.addEventListener('click', () => {
    setSectionsPanelOpen(dom.sectionsPanel.classList.contains('hidden'));
    renderEditorSections();
  });

  dom.btnInsertSlug.addEventListener('click', insertSlugAtCursor);

  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        setScriptText(evt.target.result);
        rewindToTop();
      };
      reader.readAsText(file);
    }
  });

  dom.btnFlipH.addEventListener('click', () => {
    state.mirrorX = !state.mirrorX;
    applyMirrorClasses();
    savePreferences();
  });

  dom.btnFlipV.addEventListener('click', () => {
    state.mirrorY = !state.mirrorY;
    applyMirrorClasses();
    savePreferences();
  });

  dom.btnFullscreen.addEventListener('click', toggleFullscreen);

  dom.btnDockMinimize.addEventListener('click', hideHud);
  dom.btnRestoreDock.addEventListener('click', showHud);

  window.addEventListener('mousemove', () => {
    resetHudAutoHideTimer();
  });

  dom.btnSettingsToggle.addEventListener('click', () => {
    dom.settingsDrawer.classList.toggle('hidden');
    dom.scriptEditorDrawer.classList.add('hidden');
  });

  dom.btnCloseDrawer.addEventListener('click', () => {
    dom.settingsDrawer.classList.add('hidden');
  });

  dom.btnQuickEdit.addEventListener('click', () => {
    dom.scriptEditorDrawer.classList.toggle('hidden');
    dom.settingsDrawer.classList.add('hidden');
    renderEditorSections();
  });

  dom.btnCloseEditor.addEventListener('click', () => {
    dom.scriptEditorDrawer.classList.add('hidden');
  });

  dom.btnApplyScript.addEventListener('click', () => {
    setScriptText(dom.scriptTextarea.value);
    dom.scriptEditorDrawer.classList.add('hidden');
    rewindToTop();
  });

  dom.btnClearScript.addEventListener('click', () => {
    dom.scriptTextarea.value = '';
    updateScriptMetrics('');
  });

  dom.btnLoadSampleScript.addEventListener('click', () => {
    dom.scriptTextarea.value = SAMPLE_NEWS_SCRIPT;
    updateScriptMetrics(SAMPLE_NEWS_SCRIPT);
  });

  dom.scriptTextarea.addEventListener('input', () => {
    updateScriptMetrics(dom.scriptTextarea.value);
  });

  dom.fontFamilySelect.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
    applyTypography();
    savePreferences();
  });

  dom.alignButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.textAlign = btn.dataset.align;
      applyTypography();
      savePreferences();
    });
  });

  dom.fontSizeSlider.addEventListener('input', (e) => {
    state.fontSize = Number(e.target.value);
    applyTypography();
    savePreferences();
  });

  dom.lineHeightSlider.addEventListener('input', (e) => {
    state.lineHeight = Number(e.target.value);
    applyTypography();
    savePreferences();
  });

  dom.letterSpacingSlider.addEventListener('input', (e) => {
    state.letterSpacing = Number(e.target.value);
    applyTypography();
    savePreferences();
  });

  dom.columnWidthSlider.addEventListener('input', (e) => {
    state.columnWidth = Number(e.target.value);
    applyGeometry();
    savePreferences();
  });

  dom.toggleEyelineCue.addEventListener('change', (e) => {
    state.guideVisible = e.target.checked;
    applyGeometry();
    savePreferences();
  });

  dom.eyelinePosSlider.addEventListener('input', (e) => {
    state.eyelinePos = Number(e.target.value);
    applyGeometry();
    savePreferences();
  });

  dom.toggleFocusMask.addEventListener('change', (e) => {
    state.focusMask = e.target.checked;
    applyGeometry();
    savePreferences();
  });

  dom.toggleReverse.addEventListener('change', (e) => {
    state.direction = e.target.checked ? -1 : 1;
  });

  dom.fontSwatches.forEach(btn => {
    btn.addEventListener('click', () => {
      state.fontColor = btn.dataset.color;
      applyColors();
      savePreferences();
    });
  });

  dom.bgSwatches.forEach(btn => {
    btn.addEventListener('click', () => {
      state.bgColor = btn.dataset.bgcolor;
      applyColors();
      savePreferences();
    });
  });

  dom.fontColorPicker.addEventListener('input', (e) => {
    state.fontColor = e.target.value;
    applyColors();
    savePreferences();
  });

  dom.bgColorPicker.addEventListener('input', (e) => {
    state.bgColor = e.target.value;
    applyColors();
    savePreferences();
  });

  window.addEventListener('keydown', (e) => {
    if (state.capturingKeyAction) {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        state.capturingKeyAction = null;
      } else if (!e.repeat) {
        state.keyBindings[state.capturingKeyAction] = e.code;
        state.capturingKeyAction = null;
        savePreferences();
      }
      updateKeyMappingUI();
      return;
    }

    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    const mappedAction = Object.keys(state.keyBindings).find((action) => state.keyBindings[action] === e.code);
    if (mappedAction) {
      e.preventDefault();
      if (!e.repeat) runMappedAction(mappedAction, e.code);
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (state.mode === 'toggle') {
        setRunningState(!state.isRunning);
      } else {
        if (!state.isHolding) {
          state.isHolding = true;
          setRunningState(true);
        }
      }
    } else if (e.code === 'ArrowUp' || e.code === 'BracketRight') {
      e.preventDefault();
      state.speed = Math.min(25, Number((state.speed + 0.4).toFixed(1)));
      updateSpeedUI();
      savePreferences();
    } else if (e.code === 'ArrowDown' || e.code === 'BracketLeft') {
      e.preventDefault();
      state.speed = Math.max(0.2, Number((state.speed - 0.4).toFixed(1)));
      updateSpeedUI();
      savePreferences();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      state.mirrorX = !state.mirrorX;
      applyMirrorClasses();
      savePreferences();
    } else if (e.code === 'KeyH' || e.code === 'Escape') {
      e.preventDefault();
      if (state.hudHidden) {
        showHud();
      } else {
        hideHud();
      }
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      rewindToTop();
    } else if (e.code === 'KeyE') {
      e.preventDefault();
      dom.scriptEditorDrawer.classList.toggle('hidden');
      dom.settingsDrawer.classList.add('hidden');
    } else if (e.code === 'KeyS') {
      e.preventDefault();
      dom.settingsDrawer.classList.toggle('hidden');
      dom.scriptEditorDrawer.classList.add('hidden');
    } else if (e.code === 'KeyN') {
      e.preventDefault();
      jumpSectionRelative(1);
    } else if (e.code === 'KeyB') {
      e.preventDefault();
      jumpSectionRelative(-1);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (state.mode === 'active' && state.activeControllerHoldInput === e.code) {
      state.isHolding = false;
      state.activeControllerHoldInput = null;
      setRunningState(false);
      return;
    }
    if (e.code === 'Space' && state.mode === 'active') {
      state.isHolding = false;
      setRunningState(false);
    }
  });

  dom.viewport.addEventListener('scroll', () => {
    if (!state.isRunning) {
      state.scrollPos = dom.viewport.scrollTop;
      computeTelemetry();
    }
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
