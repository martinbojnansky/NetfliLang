using NetfliLang.App;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace UWPToolkit.Template.Services
{
    public interface IScriptsService
    {
        string ReadJavascriptResourceFile(string fileName);
    }

    public class ScriptsService: IScriptsService
    {
        public string ReadJavascriptResourceFile(string fileName)
        {
            var names = typeof(App).GetTypeInfo().Assembly.GetManifestResourceNames();
            using (var reader = new StreamReader(typeof(App).GetTypeInfo().Assembly.GetManifestResourceStream($"NetfliLang.App.Scripts.{fileName}")))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
