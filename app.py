import os
import sys
import webview

def get_asset_path(filename):
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, filename)
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)

if __name__ == '__main__':
    html_file = get_asset_path('index.html')
    window = webview.create_window(
        'AhasaTV Teleprompter',
        url=html_file,
        width=1280,
        height=800,
        min_size=(800, 600),
        background_color='#060709',
        fullscreen=False,
        easy_drag=False
    )
    webview.start(private_mode=False)
