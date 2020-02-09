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
        string ReadJavascriptResourceFile(string fileName, params string[] dependencies);
    }

    public class ScriptsService: IScriptsService
    {
        public string ReadJavascriptResourceFile(string fileName, params string[] dependencies)
        {
            var scriptBuilder = new StringBuilder();

            foreach (var dependency in dependencies)
            {
                scriptBuilder.AppendLine($"// {dependency}");
                scriptBuilder.Append(ReadJavascriptResourceFile(dependency));
                scriptBuilder.AppendLine();
            }

            scriptBuilder.AppendLine($"// {fileName}");
            scriptBuilder.Append(ReadJavascriptResourceFile(fileName));

            if (dependencies.Contains("require.js"))
            {
                var fileNameParts = fileName.Split('.');
                var scriptName = fileNameParts[fileNameParts.Length - 2];
                scriptBuilder.AppendLine($"var {scriptName};");
                scriptBuilder.AppendLine($"requirejs(['{scriptName}'], module => {{ {scriptName} = module.{scriptName}; }})");
            }

            return scriptBuilder.ToString();
        }

        protected string ReadJavascriptResourceFile(string fileName)
        {
            using (var reader = new StreamReader(typeof(App).GetTypeInfo().Assembly.GetManifestResourceStream($"NetfliLang.App.Scripts.js.{fileName}")))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
