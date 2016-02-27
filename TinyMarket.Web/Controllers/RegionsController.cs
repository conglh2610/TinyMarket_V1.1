using System.Data.Entity;
using Infrastructure.Services;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TinyMarket.Web.Controllers
{
    public class RegionsController : ApiController
    {
        private readonly IRegionService regionService = null;

        public RegionsController(IRegionService regionService)
        {
            this.regionService = regionService;
        }

        [HttpGet]
        public HttpResponseMessage GetAllRegions()
        {
           var regions = regionService.GetRegions();
            return Request.CreateResponse(HttpStatusCode.OK, regions.ToList());
        }
    }
}
