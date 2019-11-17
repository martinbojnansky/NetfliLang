using Windows.Foundation.Metadata;

namespace NetfliLang.Messaging
{
    public delegate void NotificationReceivedDelegate(string action, string payload);

    [AllowForWeb]
    public sealed class WebViewMessenger
    {
        public event NotificationReceivedDelegate NotificationReceived;

        public void sendNotification(string action, string payload)
        {
            NotificationReceived?.Invoke(action, payload);
        }
    }
}
