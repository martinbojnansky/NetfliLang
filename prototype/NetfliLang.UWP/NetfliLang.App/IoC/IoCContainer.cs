using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NetfliLang.Core.IoC;
using NetfliLang.Core.Localization;
using NetfliLang.Core.Navigation;
using NetfliLang.Core.Storage;
using NetfliLang.App.ViewModels;
using NetfliLang.Core.ViewManagement;

namespace NetfliLang.App.IoC
{
    public class IoCContainer : IoCContainerBase
    {
        public override void OnBuildContainer()
        {
            Register<INavigationService, NavigationService>();
            Register<ILocalizedResources, LocalizedResources>();
            Register<ILocalObjectStorage, LocalObjectStorage>();
            Register<IRoamingObjectStorage, RoamingObjectStorage>();
            Register<IJsonSerializer, JsonSerializer>();
            Register<IXmlSerializer, XmlSerializer>();
            Register<IAppBar, AppBar>();

            AutoRegister<ViewModelBase>();
        }
    }
}
