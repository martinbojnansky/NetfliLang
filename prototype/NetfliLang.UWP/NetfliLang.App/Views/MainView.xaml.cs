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
using System.IO;
using System.Reflection;

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
                var js = GetJavascriptFile("main.js");
                await NetflixWebview.InvokeScriptAsync(js);
            }
            catch (Exception ex) {
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

        private string GetJavascriptFile(string fileName)
        {
            var names = typeof(App).GetTypeInfo().Assembly.GetManifestResourceNames();
            using (var reader = new StreamReader(typeof(App).GetTypeInfo().Assembly.GetManifestResourceStream($"UWPToolkit.Template.Scripts.{fileName}")))
            {
                return reader.ReadToEnd();
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

