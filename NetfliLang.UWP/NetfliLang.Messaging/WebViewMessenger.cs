using System;
using Windows.Foundation.Metadata;

namespace NetfliLang.Messaging
{
    public delegate void NotificationReceivedDelegate(string action, string payload);
    public delegate void ScriptInvokedDelegate(string script);
    public delegate void RefreshRequestedDelegate();

    public interface IWebViewMessenger
    {
        event NotificationReceivedDelegate NotificationReceived;
        void sendNotification(string action, string payload);

        event ScriptInvokedDelegate ScriptInvoked;
        void InvokeScript(string script);

        event RefreshRequestedDelegate RefreshRequested;
        void RequestRefresh();
    }

    [AllowForWeb]
    public sealed class WebViewMessenger : IWebViewMessenger
    {
        public event NotificationReceivedDelegate NotificationReceived;
        public void sendNotification(string action, string payload) => NotificationReceived?.Invoke(action, payload);

        public event ScriptInvokedDelegate ScriptInvoked;
        public void InvokeScript(string script) => ScriptInvoked?.Invoke(script);

        public event RefreshRequestedDelegate RefreshRequested;
        public void RequestRefresh() => RefreshRequested?.Invoke();
    }
}
