using NetfliLang.App.Models;
using NetfliLang.App.Views;
using NetfliLang.Core.Storage;
using NetfliLang.Messaging;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UWPToolkit.Template.Extensions;
using UWPToolkit.Template.Models;
using UWPToolkit.Template.Services;
using Windows.UI.Xaml.Navigation;

namespace NetfliLang.App.ViewModels
{
    public class MainViewModel : ViewModelBase
    {
        public ILocalObjectStorage LocalObjectStorage { get; set; }
        public IJsonSerializer JsonSerializer { get; set; }
        public IResourceService ResourceService { get; set; }
        public IWebViewMessenger NetflixWebViewMessenger { get; set; }
        public IWebViewMessenger GTranslateWebViewMessenger { get; set; }

        private string _netflixExtensionScript;
        public string NetflixExtensionScript => _netflixExtensionScript != null ? _netflixExtensionScript : _netflixExtensionScript = ResourceService.ReadJavascriptResourceFile("netflix.js", "require.js");

        private string _gTranslatorExtensionScript;
        public string GTranslatorExtensionScript => _gTranslatorExtensionScript != null ? _gTranslatorExtensionScript : _gTranslatorExtensionScript = ResourceService.ReadJavascriptResourceFile("translator.js", "require.js");

        private List<Language> _languages;
        public List<Language> Languages => _languages != null ? _languages : _languages = ResourceService.ReadJsonResourceFile<List<Language>>("g-languages.json");

        private Language _selectedLanguage;
        public Language SelectedLanguage
        {
            get => _selectedLanguage != null ? _selectedLanguage : _selectedLanguage = RestoreLanguage();
            set
            {
                if (value != _selectedLanguage)
                {
                    _selectedLanguage = value;
                    RaisePropertyChanged();
                    // TODO: Apply language
                }
            }
        }

        public MainViewModel() { }

        public override void OnNavigatedTo(NavigationEventArgs e)
        {
            NetflixWebViewMessenger.NotificationReceived += NetflixNotificationReceived;
            GTranslateWebViewMessenger.NotificationReceived += GTranslateNotificationReceived;

            base.OnNavigatedTo(e);
        }

        public override void OnNavigatedFrom(NavigationEventArgs e)
        {
            NetflixWebViewMessenger.NotificationReceived -= NetflixNotificationReceived;
            GTranslateWebViewMessenger.NotificationReceived -= GTranslateNotificationReceived;

            StoreLanguage();

            base.OnNavigatedFrom(e);
        }

        protected void NetflixNotificationReceived(string action, string payload)
        {
            switch (action)
            {
                case "translate":
                    var translateAction = JsonSerializer.FromJson<TranslateAction>(payload);
                    GTranslateWebViewMessenger.InvokeScript($"translator.translate('{translateAction.value.EscapeJavascript()}');");
                    break;
            }
        }

        protected void GTranslateNotificationReceived(string action, string payload)
        {
            switch (action)
            {
                case "translated":
                    var translatedAction = JsonSerializer.FromJson<TranslatedAction>(payload);
                    var onTranslated = $"netflix.translationReceived('{translatedAction.value.EscapeJavascript()}', '{translatedAction.translation.EscapeJavascript()}')";
                    NetflixWebViewMessenger.InvokeScript(onTranslated);
                    break;
            }
        }

        protected void StoreLanguage()
        {
            LocalObjectStorage.SetValue(nameof(SelectedLanguage), _selectedLanguage.Id);
        }

        protected Language RestoreLanguage()
        {
            try
            {
                var id = LocalObjectStorage.GetValue<string>(nameof(SelectedLanguage));
                return _languages.Find(l => l.Id == id);
            }
            catch
            {
                return _languages.Find(l => l.Id == "en");
            }
            finally
            {
                // TODO: Apply language
            }
        }
    }
}
