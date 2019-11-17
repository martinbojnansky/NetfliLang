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

        public MainView()
        {
            InitializeComponent();
        }

        private void NetflixWebview_NavigationStarting(WebView sender, WebViewNavigationStartingEventArgs args)
        {
            NetflixWebview.AddWebAllowedObject(nameof(NetfliLang), new WebViewMessenger());
        }

        private async void NetflixWebview_DOMContentLoaded(WebView sender, WebViewDOMContentLoadedEventArgs args)
        {
            try
            {
                await NetflixWebview.InvokeScriptAsync($"{nameof(NetfliLang)}.sendNotification('xxx');");
            }
            catch { }
        }

        private void ScriptNotify(object sender, NotifyEventArgs e)
        {
            Debug.WriteLine($"script: {e?.Value}");
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

