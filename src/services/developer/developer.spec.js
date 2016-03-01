describe('<> ImpacDeveloper Provider', function () {
  'use strict';


  var rootScope, ImpacDeveloper, provider = {};

  var stubbedTemplates = [
    {name: 'widget template 1', path: 'foo/engine'},
    {name: 'widget template 2', path: 'foo/engine', metadata: { template: 'awesome/template' }}
  ];

  function configureProvider(options) {
    provider.options = options
    module('maestrano.impac', function (ImpacDeveloperProvider) {
      ImpacDeveloperProvider.configure(options);
    });
    inject(function (_ImpacDeveloper_, $rootScope) {
      ImpacDeveloper = _ImpacDeveloper_;
      rootScope = $rootScope;
    });
  }

  describe('service.isEnabled', function () {
    describe('by default', function () {
      beforeEach(function () {
        configureProvider();
      });

      it('status is false', function () {
        expect(ImpacDeveloper.isEnabled()).toEqual(false);
      });
    })
    describe('configured as status true', function () {
      beforeEach(function () {
        configureProvider({status: true});
      });

      it('service.isEnabled returns true', function () {

        expect(ImpacDeveloper.isEnabled()).toEqual(provider.options.status);
      });
    });
  });

  // WIDGETS
  // ---------------
  describe('service.stubWidgetsTemplates', function () {
    var templatesFromAPI = [{name: 'API Template 1'}, {name: 'API Template 2'}];

    describe('with stubbed templates provided', function () {
      beforeEach(function () {
        configureProvider({widgetsTemplates: stubbedTemplates});
      });

      it('returns an array of stubbed templates, and api templates', function () {
        expect(ImpacDeveloper.stubWidgetsTemplates(templatesFromAPI)).toEqual(
          templatesFromAPI.concat(provider.options.widgetsTemplates)
        );
      })
    });

    describe('with no stubbed templates provided', function () {
      beforeEach(function () {
        configureProvider();
      });

      it('returns an array of api templates', function () {
        expect(ImpacDeveloper.stubWidgetsTemplates(templatesFromAPI)).toEqual(templatesFromAPI);
      })
    });
  });

  describe('service.findTemplate', function () {
    beforeEach(function () {
      configureProvider({widgetsTemplates: stubbedTemplates});
    });

    it('returns the correct templates', function () {
      expect(ImpacDeveloper.findTemplate({ path: 'foo/engine' })).toEqual(stubbedTemplates[0]);
      expect(ImpacDeveloper.findTemplate({ path: 'foo/engine', metadata: { template: 'awesome/template' } })).toEqual(stubbedTemplates[1]);
    });
  });

  describe('service.isWidgetStubbed', function () {
    var widget = { name: 'widget 1', widget_category: 'foo/engine', width: 3 };

    beforeEach(function () {
      configureProvider({widgetsTemplates: stubbedTemplates});
      spyOn(ImpacDeveloper, 'findTemplate').and.returnValue({not: 'empty'});
    });

    it('returns the correct boolean value', function () {
      expect(ImpacDeveloper.isWidgetStubbed(widget)).toEqual(true);
      expect(ImpacDeveloper.findTemplate).toHaveBeenCalledWith({ path: 'foo/engine' });
      widget.metadata = { template: 'awesome/template' };
      expect(ImpacDeveloper.isWidgetStubbed(widget)).toEqual(true);
      expect(ImpacDeveloper.findTemplate).toHaveBeenCalledWith({ path: 'foo/engine', metadata: { template: 'awesome/template' } });
    });
  });

  describe('service.createWidgetStub', function () {
    var dashboard = { data_sources: [{uid: 'org-a123'}, {uid: 'org-b456'}], currency: 'AUD' };
    var widget = { widget_category: 'foo/engine', metadata: { template: 'awesome/template' } };
    beforeEach(function () {
      configureProvider({widgetsTemplates: stubbedTemplates});
      spyOn(ImpacDeveloper, 'findTemplate').and.returnValue(stubbedTemplates[1]);
    });

    it('stubs the create widget response', function () {
      var response;
      ImpacDeveloper.createWidgetStub(widget, dashboard).then(function (res) {
        response = res;
      });
      rootScope.$apply();
      expect(ImpacDeveloper.findTemplate).toHaveBeenCalledWith({ path: 'foo/engine', metadata: { template: 'awesome/template' } });
      expect(response.data.name).toEqual(stubbedTemplates[1].name);
      expect(response.data.category).toEqual(stubbedTemplates[1].path);
      expect(response.data.metadata).toEqual({
        template: stubbedTemplates[1].metadata.template,
        organization_ids: ['org-a123', 'org-b456'],
        currency: 'AUD'
      });
    });
  });

});
