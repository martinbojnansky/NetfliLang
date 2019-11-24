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
using NetfliLang.Core.Storage;
using UWPToolkit.Template.Models;

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

        #region Netflix

        private void NetflixWebview_NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            NetflixWebview.AddWebAllowedObject(nameof(NetfliLang), WebViewMessenger);
        }

        private async void NetflixWebview_DOMContentLoaded(WebView sender, WebViewDOMContentLoadedEventArgs args)
        {
            try
            {
                var js = GetJavascriptFile("netflix.js");
                await NetflixWebview.InvokeScriptAsync(js);
            }
            catch (Exception ex) {
            }
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

        #endregion

        #region Gtranslate

        private void TranslatorWebview_NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            TranslatorWebview.AddWebAllowedObject(nameof(NetfliLang), WebViewMessenger);
        }

        private async void TranslatorWebview_DOMContentLoaded(WebView sender, WebViewDOMContentLoadedEventArgs args)
        {
            try
            {
                var js = GetJavascriptFile("gtranslator.js");
                await TranslatorWebview.InvokeScriptAsync(js);
            }
            catch (Exception ex)
            {
            }
        }

        #endregion

        private async void WebViewMessenger_NotificationReceived(string action, string payload)
        {
            try
            {
                var serializer = new JsonSerializer();

                switch (action)
                {
                    case "translate":
                        var translateAction = serializer.FromJson<TranslateAction>(payload);
                        await TranslatorWebview.InvokeScriptAsync($"translate('{string.Join("|", translateAction.lines).EscapeString()}');");
                        break;
                    case "translated":
                        var translatedAction = serializer.FromJson<TranslatedAction>(payload);
                        var onTranslated = $"translationReceived('{translatedAction.value.Replace("|", "").EscapeString()}', { serializer.ToJson(translatedAction.translation.Split('|')).EscapeString()})";
                        await NetflixWebview.InvokeScriptAsync(onTranslated);     
                        break;
                }
                 
            }
            catch { }
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

        public static string EscapeString(this string text)
        {
            return text.Replace("'", "\'");
        }
    }
}

