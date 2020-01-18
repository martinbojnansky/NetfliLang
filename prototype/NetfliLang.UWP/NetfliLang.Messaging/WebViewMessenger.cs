using System;
using Windows.Foundation.Metadata;

namespace NetfliLang.Messaging
{
    public delegate void ScriptInvokedDelegate(string script);
    public delegate void NotificationReceivedDelegate(string action, string payload);

    public interface IWebViewMessenger
    {
        event ScriptInvokedDelegate ScriptInvoked;
        event NotificationReceivedDelegate NotificationReceived;

        void InvokeScript(string script);
        void sendNotification(string action, string payload);
    }

    [AllowForWeb]
    public sealed class WebViewMessenger : IWebViewMessenger
    {
        public event ScriptInvokedDelegate ScriptInvoked;
        public event NotificationReceivedDelegate NotificationReceived;

        public void InvokeScript(string script)
        {
            ScriptInvoked?.Invoke(script);
        }

        public void sendNotification(string action, string payload)
        {
            NotificationReceived?.Invoke(action, payload);
        }
    }
}
