import { MantineProvider } from '@mantine/core'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { customTheme } from './theme'
import { HashRouter } from 'react-router-dom'
import { ModalsProvider } from '@mantine/modals'
import { RecoilRoot } from 'recoil'
import LocaleProvider from './providers/LocaleProvider'
import { isEnvBrowser } from './utils/misc'
import { fetchNui } from './utils/fetchNui'

  /**
   * Prevents keybinds from firing while typing in input fields.
   * MutationObserver catches dynamically added inputs (modals, etc.)
   * and attaches focus/blur listeners that toggle SetNuiFocusKeepInput.
   */
  ; (() => {
    const INPUT_SELECTOR = 'input, textarea, select, [contenteditable="true"], [role="combobox"], [role="textbox"], [role="spinbutton"]'
    const handled = new WeakSet<Element>()

    const attachListeners = (elements: NodeListOf<Element> | Element[]) => {
      elements.forEach((el) => {
        if (handled.has(el)) return
        handled.add(el)
        el.addEventListener('focus', () => fetchNui('dolu_tool:setInputFocus', false))
        el.addEventListener('blur', () => fetchNui('dolu_tool:setInputFocus', true))
      })
    }

    const processNode = (node: Node) => {
      if (!(node instanceof Element)) return
      if ((node as HTMLElement).matches?.(INPUT_SELECTOR)) attachListeners([node])
      if (node.childNodes.length > 0) attachListeners(node.querySelectorAll(INPUT_SELECTOR))
    }

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) processNode(node)
      }
    }).observe(document.body, { childList: true, subtree: true })

    attachListeners(document.body.querySelectorAll(INPUT_SELECTOR))
  })()

if (isEnvBrowser()) {
  const root = document.getElementById('root')
  // https://i.imgur.com/iPTAdYV.png - Night time img
  root!.style.backgroundImage = 'url("https://i.imgur.com/vDGEfYg.jpeg")'
  root!.style.backgroundSize = 'cover'
  root!.style.backgroundRepeat = 'no-repeat'
  root!.style.backgroundPosition = 'center'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <HashRouter>
        <MantineProvider withNormalizeCSS withGlobalStyles theme={customTheme}>
          <RecoilRoot>
            <ModalsProvider
              modalProps={{
                size: 'xs',
                transition: 'slide-up',
                // Modals would overflow the page with slide-up transition
                styles: { inner: { overflow: 'hidden' } },
              }}
            >
              <App />
            </ModalsProvider>
          </RecoilRoot>
        </MantineProvider>
      </HashRouter>
    </LocaleProvider>
  </React.StrictMode>
)
