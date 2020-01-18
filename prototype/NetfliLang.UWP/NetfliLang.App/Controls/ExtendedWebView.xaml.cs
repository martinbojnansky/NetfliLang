using NetfliLang.Messaging;
using System;
using System.Diagnostics;
using System.Threading.Tasks;
using UWPToolkit.Template.Extensions;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace UWPToolkit.Template.Controls
{
    public sealed partial class ExtendedWebView : UserControl
    {
        public string Source
        {
            get => (string)GetValue(SourceProperty);
            set { SetValue(SourceProperty, value); }
        }

        public static readonly DependencyProperty SourceProperty =
            DependencyProperty.Register(nameof(Source), typeof(string), typeof(ExtendedWebView), null);

        public string ExtensionScript
        {
            get => (string)GetValue(ExtensionScriptProperty);
            set { SetValue(ExtensionScriptProperty, value); }
        }

        public static readonly DependencyProperty ExtensionScriptProperty =
            DependencyProperty.Register(nameof(ExtensionScript), typeof(string), typeof(ExtendedWebView), null);

        public IWebViewMessenger WebViewMessenger
        {
            get => (IWebViewMessenger)GetValue(WebViewMessengerProperty);
            set { SetValue(WebViewMessengerProperty, value); }
        }

        public static readonly DependencyProperty WebViewMessengerProperty =
            DependencyProperty.Register(nameof(WebViewMessenger), typeof(IWebViewMessenger), typeof(ExtendedWebView), null);

        public ExtendedWebView()
        {
            InitializeComponent();
        }

        private async void DOMContentLoaded(WebView sender, WebViewDOMContentLoadedEventArgs args)
        {
            await InvokeScriptAsync(ExtensionScript);

            if (WebViewMessenger != null)
            {
                WebViewMessenger.ScriptInvoked += WebViewMessenger_ScriptInvoked;
            }
        }

        private void NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            if (WebView != null && WebViewMessenger != null)
            {
                WebView.AddWebAllowedObject(nameof(NetfliLang), WebViewMessenger);
            }
        }

        private async void WebViewMessenger_ScriptInvoked(string script)
        {
            await InvokeScriptAsync(script);
        }

        private async Task InvokeScriptAsync(string script)
        {
            try
            {
                await WebView.InvokeJavascriptAsync(script);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
            }
        }

        private void ContainsFullScreenElementChanged(WebView sender, object args)
        {
            if (sender.ContainsFullScreenElement)
            {
                ApplicationView.GetForCurrentView().TryEnterFullScreenMode();
            }
            else
            {
                ApplicationView.GetForCurrentView().ExitFullScreenMode();
            }
        }
    }
}
