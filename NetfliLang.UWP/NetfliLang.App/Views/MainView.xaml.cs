using NetfliLang.Core.Navigation;
using NetfliLang.App.ViewModels;
using Windows.UI.Xaml;

namespace NetfliLang.App.Views
{
    public sealed partial class MainView : NavigationPage, INavigationPage<MainViewModel>
    {
        public MainViewModel ViewModel { get; set; } = ((App)Application.Current).MvvmLocator.ResolveViewModel<MainViewModel>();

        public MainView()
        {
            InitializeComponent();
        }
    }
}

