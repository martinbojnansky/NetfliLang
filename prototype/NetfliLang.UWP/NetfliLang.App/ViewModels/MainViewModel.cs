using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NetfliLang.App.Views;
using NetfliLang.Core.Storage;

namespace NetfliLang.App.ViewModels
{
    public class MainViewModel : ViewModelBase
    {
        public ILocalObjectStorage LocalObjectStorage;

        private bool _isTranslatorVisible = false;

        public bool IsTranslatorVisible
        {
            get => _isTranslatorVisible;
            set {
                _isTranslatorVisible = value;
                RaisePropertyChanged();
            }
        }

        private double _playbackSpeed = 1.0;
        public double PlaybackSpeed
        {
            //get {
            //    try { return LocalObjectStorage.GetValue<double>(nameof(PlaybackSpeed)); }
            //    catch { return 1; }
            //}
            //set
            //{
            //    try
            //    {
            //        LocalObjectStorage.SetValue(nameof(PlaybackSpeed), value);
            //        RaisePropertyChanged();
            //    }
            //    catch { }
            //}
            get => _playbackSpeed;
            set
            {
                _playbackSpeed = value;
                RaisePropertyChanged();
            }
        }

        public void NavigateToSettingsPage()
        {
            Navigation.GoTo(typeof(SettingsView), "This is navigation parameter");
        }
    }
}
