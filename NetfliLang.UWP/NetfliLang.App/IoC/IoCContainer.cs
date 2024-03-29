﻿using NetfliLang.Core.IoC;
using NetfliLang.Core.Localization;
using NetfliLang.Core.Navigation;
using NetfliLang.Core.Storage;
using NetfliLang.App.ViewModels;
using NetfliLang.Core.ViewManagement;
using UWPToolkit.Template.Services;
using NetfliLang.Messaging;
using NetfliLang.App.Services;

namespace NetfliLang.App.IoC
{
    public class IoCContainer : IoCContainerBase
    {
        public override void OnBuildContainer()
        {
            RegisterSingle<INavigationService, NavigationService>();
            // RegisterSingle<ILocalizedResources, LocalizedResources>();
            RegisterSingle<ILocalObjectStorage, LocalObjectStorage>();
            //RegisterSingle<IRoamingObjectStorage, RoamingObjectStorage>();
            RegisterSingle<IJsonSerializer, JsonSerializer>();
            //RegisterSingle<IXmlSerializer, XmlSerializer>();
            //RegisterSingle<IAppBar, AppBar>();       
            RegisterSingle<INetworkAvailabilityService, NetworkAvailabilityService>();


            AutoRegister<ViewModelBase>();

            Register<IWebViewMessenger, WebViewMessenger>();
            RegisterSingle<IResourceService, ResourceService>();
        }
    }
}
