using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NetfliLang.Core.IoC;
using Windows.ApplicationModel.Resources;

namespace NetfliLang.Core.Localization
{
    public interface ILocalizedResources
    {
        string GetString(string name);
    }

    public class LocalizedResources : ILocalizedResources
    {
        private ResourceLoader _resourceLoader;

        public LocalizedResources()
        {
            _resourceLoader = new ResourceLoader();
        }

        public string GetString(string name) => _resourceLoader.GetString(name);
    }
}
