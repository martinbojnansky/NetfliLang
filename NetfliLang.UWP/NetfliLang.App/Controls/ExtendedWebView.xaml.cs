using NetfliLang.Messaging;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using UWPToolkit.Template.Extensions;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;

namespace NetfliLang.App.Controls
{
    public sealed partial class ExtendedWebView : UserControl
    {
        private SemaphoreSlim _semaphore = new SemaphoreSlim(1,1);

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
        }

        private void NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            ProgressBar.Visibility = Visibility.Visible;

            if (WebView != null && WebViewMessenger != null)
            {
                WebView.AddWebAllowedObject(nameof(NetfliLang), WebViewMessenger);

                WebViewMessenger.ScriptInvoked += async (string script) => await InvokeScriptAsync(script);
                WebViewMessenger.RefreshRequested += async () => await RefreshAsync();
            }
        }

        private void NavigationCompleted(WebView sender, WebViewNavigationCompletedEventArgs args)
        {
            ProgressBar.Visibility = Visibility.Collapsed;
        }

        private void NavigationFailed(object sender, WebViewNavigationFailedEventArgs e)
        {
            ProgressBar.Visibility = Visibility.Collapsed;
        }

        private async Task<string> InvokeScriptAsync(string script)
        {
            try
            {
                await _semaphore.WaitAsync();
                return await WebView.InvokeJavascriptAsync(script);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex);
                return null;
            }
            finally
            {
                _semaphore.Release(1);
            }
        }

        private async Task RefreshAsync()
        {
            var absoluteUri = WebView?.Source.AbsoluteUri;
            var hrefLocation = await InvokeScriptAsync("window.location.href");

            if (absoluteUri != hrefLocation)
            {
                WebView?.Navigate(WebView.Source);
            }
            else
            {
                await InvokeScriptAsync("window.location.reload()");
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
