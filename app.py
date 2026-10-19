import os
import sys
import webview

class Api:
    def __init__(self):
        self._window = None

    def set_window(self, window):
        self._window = window

    def toggle_fullscreen(self):
        if self._window:
            self._window.toggle_fullscreen()
            return self._window.fullscreen
        return False

def get_asset_path(filename):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, filename)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)

if __name__ == '__main__':
    api = Api()
    html_file = get_asset_path('index.html')
    window = webview.create_window(
        'AhasaTV Teleprompter',
        url=html_file,
        js_api=api,
        width=1280,
        height=800,
        min_size=(800, 600),
        background_color='#060709',
        fullscreen=False,
        maximized=True,
        easy_drag=False
    )
    api.set_window(window)
    webview.start(private_mode=False)
