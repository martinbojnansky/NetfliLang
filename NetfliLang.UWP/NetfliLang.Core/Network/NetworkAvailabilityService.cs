using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel.Core;
using Windows.Networking.Connectivity;
using Windows.UI.Core;
using Windows.UI.Xaml;

namespace NetfliLang.App.Services
{
    public interface INetworkAvailabilityService
    {
        bool GetNetworkStatus();
        event NetworkStatusChangedDelegate NetworkStatusChanged;
    }

    public delegate void NetworkStatusChangedDelegate(bool isAvailable);

    public class NetworkAvailabilityService : INetworkAvailabilityService
    {
        public event NetworkStatusChangedDelegate NetworkStatusChanged;

        public NetworkAvailabilityService()
        {
            NetworkInformation.NetworkStatusChanged += OnNetworkStatusChanged;
        }

        public bool GetNetworkStatus() => NetworkInterface.GetIsNetworkAvailable();

        protected async void OnNetworkStatusChanged(object sender)
        {
            await CoreApplication.MainView.CoreWindow.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () => {
                NetworkStatusChanged?.Invoke(GetNetworkStatus());
            });
        }
    }
}
