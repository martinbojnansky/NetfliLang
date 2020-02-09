using System;
using System.Threading.Tasks;
using Windows.UI.Xaml.Controls;

namespace UWPToolkit.Template.Extensions
{
    public static class JavascriptExtensions
    {
        public static string EscapeJavascript(this string javascript)
        {
            return javascript?.Replace("'", "\'");
        }

        public static async Task<string> InvokeJavascriptAsync(this WebView webView, string javascript)
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
