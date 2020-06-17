using NetfliLang.App.Models;
using NetfliLang.App.Services;
using NetfliLang.Core.Storage;
using NetfliLang.Messaging;
using System;
using System.Collections.Generic;
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
        public INetworkAvailabilityService NetworkAvailabilityService { get; set; }

        public MainViewModel() { }

        public override void OnNavigatedTo(NavigationEventArgs e)
        {
            NetflixWebViewMessenger.NotificationReceived += NetflixNotificationReceived;
            GTranslateWebViewMessenger.NotificationReceived += GTranslateNotificationReceived;
            NetworkAvailabilityService.NetworkStatusChanged += NetworkStatusChanged;

            base.OnNavigatedTo(e);
        }

        public override void OnNavigatedFrom(NavigationEventArgs e)
        {
            NetflixWebViewMessenger.NotificationReceived -= NetflixNotificationReceived;
            GTranslateWebViewMessenger.NotificationReceived -= GTranslateNotificationReceived;
            NetworkAvailabilityService.NetworkStatusChanged -= NetworkStatusChanged;

            base.OnNavigatedFrom(e);
        }

        #region Netflix

        public readonly string NetflixDefaultUrl = "https://www.netflix.com/";

        private string _netflixExtensionScript;
        public string NetflixExtensionScript => _netflixExtensionScript != null ? _netflixExtensionScript : _netflixExtensionScript = ResourceService.ReadJavascriptResourceFile("netflix.js", "require.js");

        protected void NetflixNotificationReceived(string action, string payload)
        {
            switch (action)
            {
                case "ready":
                    ApplyAutoPause(AutoPause);
                    ApplySpeed(Speed);
                    break;
                case "translate":
                    var translateAction = JsonSerializer.FromJson<TranslateAction>(payload);
                    GTranslateWebViewMessenger.InvokeScript($"translator.translate('{translateAction.value.EscapeJavascript()}');");
                    break;
            }
        }

        #endregion

        #region GTranslator

        public readonly string GTranslatorDefaultUrl = "https://translate.google.com/";

        private string _gTranslatorExtensionScript;
        public string GTranslatorExtensionScript => _gTranslatorExtensionScript != null ? _gTranslatorExtensionScript : _gTranslatorExtensionScript = ResourceService.ReadJavascriptResourceFile("translator.js", "require.js");

        protected void GTranslateNotificationReceived(string action, string payload)
        {
            switch (action)
            {
                case "ready":
                    ApplyLanguage(Language);
                    break;
                case "translated":
                    var translatedAction = JsonSerializer.FromJson<TranslatedAction>(payload);
                    var onTranslated = $"netflix.translationReceived('{translatedAction.value.EscapeJavascript()}', '{translatedAction.translation.EscapeJavascript()}');";
                    NetflixWebViewMessenger.InvokeScript(onTranslated);
                    break;
            }
        }

        #endregion

        #region Settings

        #region General

        protected void StoreUserSetting(string key, object value)
        {
            LocalObjectStorage.SetValue(key, value);
        }

        protected TResult RestoreUserSetting<TSetting, TResult>(string key, Func<TSetting, TResult> map, TResult fallback = default(TResult))
        {
            try
            {
                var setting = LocalObjectStorage.GetValue<TSetting>(key);
                return map(setting);
            }
            catch
            {
                return fallback;
            }
        }

        #endregion

        #region Language

        private List<Language> _languages;
        public List<Language> Languages => _languages != null ? _languages : _languages = ResourceService.ReadJsonResourceFile<List<Language>>("g-languages.json");

        private Language _language;
        public Language Language
        {
            get => _language != null ? _language : _language = RestoreUserSetting<string, Language>(nameof(Language), id => _languages.Find(l => l.Id == id), _languages.Find(l => l.Id == "en"));
            set
            {
                if (value != _language)
                {
                    _language = value;
                    RaisePropertyChanged();
                    ApplyLanguage(value);
                    StoreUserSetting(nameof(Language), value?.Id);
                }
            }
        }

        protected void ApplyLanguage(Language language)
        {
            NetflixWebViewMessenger.InvokeScript("netflix.clearTranslations();");
            GTranslateWebViewMessenger.InvokeScript($"translator.selectTargetLanguage('{language.Id}');");
        }

        #endregion

        #region AutoPause

        private bool? _autoPause;
        public bool? AutoPause
        {
            get => _autoPause != null ? _autoPause : _autoPause = RestoreUserSetting<bool?, bool?>(nameof(AutoPause), v => v, true);
            set
            {
                if (value != _autoPause)
                {
                    _autoPause = value;
                    RaisePropertyChanged();
                    ApplyAutoPause(value);
                    StoreUserSetting(nameof(AutoPause), value);
                }
            }
        }

        protected void ApplyAutoPause(bool? autoPause)
        {
            NetflixWebViewMessenger.InvokeScript($"netflix.setAutoPause({autoPause.ToString().ToLower()});");
        }

        #endregion

        #region Speed

        public readonly List<Speed> Speeds = new List<Speed>() {
            new Speed(0.6, "0.60x"),
            new Speed(0.65, "0.65x"),
            new Speed(0.70, "0.70x"),
            new Speed(0.75, "0.75x"),
            new Speed(0.8, "0.80x"),
            new Speed(0.85, "0.85x"),
            new Speed(0.9, "0.90x"),
            new Speed(0.95, "0.95x"),
            new Speed(1.0, "1.0x"),
        };

        private Speed _speed;
        public Speed Speed
        {
            get => _speed != null ? _speed : _speed = RestoreUserSetting<double, Speed>(nameof(Speed), v => Speeds.Find(s => s.Rate == v), Speeds.Find(s => s.Rate == 1.0));
            set
            {
                if (value != _speed)
                {
                    _speed = value;
                    RaisePropertyChanged();
                    ApplySpeed(value);
                    StoreUserSetting(nameof(Speed), value?.Rate);
                }
            }
        }

        protected void ApplySpeed(Speed speed)
        {
            NetflixWebViewMessenger.InvokeScript($"netflix.setSpeed({speed?.Rate});");
        }

        #endregion

        #endregion

        #region NetworkAvailability

        private bool? _isNetworkUnavailable;
        public bool? IsNetworkUnavailable
        {
            get => _isNetworkUnavailable != null ? _isNetworkUnavailable : _isNetworkUnavailable = !NetworkAvailabilityService.GetNetworkStatus();
            set
            {
                _isNetworkUnavailable = value;
                RaisePropertyChanged();
            }
        }

        protected void NetworkStatusChanged(bool isAvailable)
        {
            IsNetworkUnavailable = !isAvailable;

            if (isAvailable)
            {
                Refresh();
            }
        }

        public void Refresh()
        {
            NetflixWebViewMessenger.RequestRefresh();
            GTranslateWebViewMessenger.RequestRefresh();
        }

        #endregion
    }
}
