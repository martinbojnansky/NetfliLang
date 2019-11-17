using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation.Metadata;

namespace NetfliLang.Messaging
{
    public delegate void SendNotificationHandler(string notification);

    [AllowForWeb]
    public sealed class WebViewMessenger
    {
        public event SendNotificationHandler SendNotificationEvent;

        public void sendNotification(string notification)
        {
            Debug.WriteLine($"notification: {notification}");
        }
    }
}
