using System;
using NetfliLang.Core.Navigation;
using NetfliLang.App.ViewModels;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using System.Threading.Tasks;
using System.Diagnostics;
using Windows.UI.ViewManagement;
using NetfliLang.Messaging;

namespace NetfliLang.App.Views
{
    public sealed partial class MainView : NavigationPage, INavigationPage<MainViewModel>
    {
        public MainViewModel ViewModel { get; set; } = ((App)Application.Current).MvvmLocator.ResolveViewModel<MainViewModel>();

        public WebViewMessenger WebViewMessenger = new WebViewMessenger();

        public MainView()
        {
            InitializeComponent();

            WebViewMessenger.NotificationReceived += WebViewMessenger_NotificationReceived;
        }

        private void NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            NetflixWebview.AddWebAllowedObject(nameof(NetfliLang), WebViewMessenger);
        }

        private async void DOMContentLoaded(WebView sender, WebViewDOMContentLoadedEventArgs args)
        {
            try
            {
                await NetflixWebview.InvokeScriptAsync(@"
                    let xhrOpen = window.XMLHttpRequest.prototype.open;

                    window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
                        this.addEventListener('load', function () {
                            try {
                                const parser = new DOMParser();
                                const ttmlDoc = parser.parseFromString(this.responseText, 'text/xml');
                                const subtitles = Array.from(ttmlDoc.querySelectorAll('p')).map(p => p.textContent).join('|');
                                if (subtitles && window.location.href.includes('netflix.com/watch')) {
                                    NetfliLang.sendNotification('SubtitlesLoaded', subtitles);
                                }
                            }
                            catch(e) {}
                        });

                        return xhrOpen.apply(this, arguments);
                    }                    
                ");
            }
            catch {
            }
        }

        private async void WebViewMessenger_NotificationReceived(string action, string payload)
        {
            try
            {
                var subtitles = payload.Replace("'", "\'");
                await TranslatorWebview.InvokeScriptAsync($"document.querySelector('#source').value = '{subtitles}'");
                ViewModel.ShowTranslation = true;           
            }
            catch { }
            }

        private void ContainsFullScreenElementChanged(WebView sender, object args)
        {
            if (sender.ContainsFullScreenElement)
            {
                ApplicationView.GetForCurrentView().TryEnterFullScreenMode();
            } else
            {
                ApplicationView.GetForCurrentView().ExitFullScreenMode();
            }
        }
    }

    public static class Extensions
    {
        public static async Task<string> InvokeScriptAsync(this WebView webView, string javascript)
        {
            try
            {
                return await webView.InvokeScriptAsync("eval", new string[] { javascript });
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}

