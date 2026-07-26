import { useEffect, useState } from 'react'

/**
 * useTelegram – extracts Telegram Web App data and utilities.
 *
 * Reads from window.Telegram.WebApp which is injected by the
 * Telegram SDK script in index.html.
 *
 * Returns:
 *  - tg          : raw Telegram.WebApp object
 *  - telegramUser: user object from initDataUnsafe
 *  - isReady     : true after tg.ready() has been called
 *  - colorScheme : 'dark' | 'light'
 *  - themeParams : Telegram theme colours
 *  - close()     : close the Mini App
 *  - expand()    : expand to full screen
 */
function useTelegram() {
  const tg = window?.Telegram?.WebApp

  const [isReady, setIsReady] = useState(false)
  const [telegramUser, setTelegramUser] = useState(null)
  const [colorScheme, setColorScheme] = useState('dark')
  const [themeParams, setThemeParams] = useState({})

  useEffect(() => {
    if (!tg) {
      // Running outside Telegram (e.g. browser dev) – use mock data
      console.warn('Telegram WebApp SDK not found. Using mock user data.')
      setTelegramUser({
        id: 123456789,
        username: 'devuser',
        first_name: 'Dev',
        last_name: 'User',
        photo_url: null,
      })
      setIsReady(true)
      return
    }

    // Signal to Telegram that the app is ready to be displayed
    tg.ready()
    tg.expand()

    setTelegramUser(tg.initDataUnsafe?.user ?? null)
    setColorScheme(tg.colorScheme ?? 'dark')
    setThemeParams(tg.themeParams ?? {})
    setIsReady(true)

    // Listen for theme changes (user toggles dark/light)
    const handleThemeChange = () => {
      setColorScheme(tg.colorScheme)
      setThemeParams(tg.themeParams)
    }
    tg.onEvent('themeChanged', handleThemeChange)

    return () => {
      tg.offEvent('themeChanged', handleThemeChange)
    }
  }, [])

  /** Close the Mini App */
  const close = () => tg?.close()

  /** Expand to full viewport */
  const expand = () => tg?.expand()

  /**
   * Show Telegram native popup.
   * @param {string} message
   */
  const showAlert = (message) => {
    if (tg?.showAlert) {
      tg.showAlert(message)
    } else {
      alert(message)
    }
  }

  return {
    tg,
    telegramUser,
    isReady,
    colorScheme,
    themeParams,
    close,
    expand,
    showAlert,
  }
}

export default useTelegram
