using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using NetfliLang.Core.Navigation;
using NetfliLang.App.ViewModels;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using System.Threading.Tasks;
using System.Diagnostics;
using Windows.System;

namespace NetfliLang.App.Views
{
    public sealed partial class MainView : NavigationPage, INavigationPage<MainViewModel>
    {
        public MainViewModel ViewModel { get; set; } = ((App)Application.Current).MvvmLocator.ResolveViewModel<MainViewModel>();

        private DispatcherTimer dispatcherTimer;
        private List<string> titles = new List<string>();
        private int titleIndex = 0;

        public MainView()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);

            dispatcherTimer = new DispatcherTimer();
            dispatcherTimer.Tick += DispatcherTimer_Tick;
            dispatcherTimer.Interval = new TimeSpan(0, 0, 2);
            dispatcherTimer.Start();
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            dispatcherTimer.Stop();
            base.OnNavigatedFrom(e);
        }

        private async void DispatcherTimer_Tick(object sender, object e)
        {
            await LogTitle();
        }

        private async Task LogTitle()
        {
            try
            {
                var title = await NetflixWebview.InvokeScriptAsync("document.querySelector('.player-timedtext-text-container').innerText");
                title = title?.Replace("\n", "\\n");

                if (!string.IsNullOrWhiteSpace(title) && !title.Contains("Exception from HRESULT:"))
                {
                    if (titles.Count > 0)
                    {
                        if (!titles[titles.Count - 1].Equals(title))
                        {
                            titles.Add(title);

                            if (titles.Count > 10)
                            {
                                titles.RemoveAt(0);
                            }
                        }
                    } else {
                        titles.Add(title);

                        if (titles.Count > 10)
                        {
                            titles.RemoveAt(0);
                        }
                    }
                }
            }
            catch { }
        }

        private async Task ShowTitle()
        {
            try
            {
                var title = titles[titleIndex];
                await TranslatorWebview.InvokeScriptAsync($"document.querySelector('#source').value = '{title}'");
                ViewModel.ShowTranslation = true;
            }
            catch { }
        }

        private async void ToggleButton_Checked(object sender, RoutedEventArgs e)
        {
            try
            {
                await NetflixWebview.InvokeScriptAsync("document.querySelector('video').pause()");
                await LogTitle();
                titleIndex = titles.Count - 1;

                if(titles.Count > 0)
                {
                    await ShowTitle();
                }
            }
            catch { }
        }

        private async void ToggleButton_Unchecked(object sender, RoutedEventArgs e)
        {
            try
            {
                ViewModel.ShowTranslation = false;
                await NetflixWebview.InvokeScriptAsync("document.querySelector('video').play()");
            }
            catch { }
        }

        private async void ToggleButton_RightTapped(object sender, RightTappedRoutedEventArgs e)
        {
            try
            {
                await NetflixWebview.InvokeScriptAsync("document.querySelector('video').pause()");
                await LogTitle();

                if (!ViewModel.ShowTranslation)
                {
                    titleIndex = titles.Count - 1;       
                }

                titleIndex--;
                if (titleIndex >= 0)
                {
                    await ShowTitle();
                }
            }
            catch { }
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

