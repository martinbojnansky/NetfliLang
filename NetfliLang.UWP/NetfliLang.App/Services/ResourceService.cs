using NetfliLang.App;
using NetfliLang.Core.Storage;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace UWPToolkit.Template.Services
{
    public interface IResourceService
    {
        string ReadJavascriptResourceFile(string fileName, params string[] dependencies);
        T ReadJsonResourceFile<T>(string fileName);
    }

    public class ResourceService: IResourceService
    {
        public IJsonSerializer JsonSerializer { get; set; }

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

        public T ReadJsonResourceFile<T>(string fileName)
        {
            using (var reader = new StreamReader(typeof(App).GetTypeInfo().Assembly.GetManifestResourceStream($"NetfliLang.App.Resources.Json.{fileName}")))
            {
                var json = reader.ReadToEnd();
                return JsonSerializer.FromJson<T>(json);
            }
        }

        protected string ReadJavascriptResourceFile(string fileName)
        {
            using (var reader = new StreamReader(typeof(App).GetTypeInfo().Assembly.GetManifestResourceStream($"NetfliLang.App.Resources.Javascript.{fileName}")))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
