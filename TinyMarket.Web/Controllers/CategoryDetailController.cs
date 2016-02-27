using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Web.Http;
using Infrastructure.Services;

namespace MakingSampleCode.Controllers
{
    public class CategoryDetailController : ApiController
    {
        private readonly ICategoryDetailService categoryDetailService = null;

        public CategoryDetailController(ICategoryDetailService categoryDetailService)
        {
            this.categoryDetailService = categoryDetailService;
        }

        [HttpGet]
        public HttpResponseMessage GetAllCategoryDetails()
        {
            var categories = categoryDetailService.GetCategoriesDetail();
            return Request.CreateResponse(HttpStatusCode.OK, categories.ToList());
        }
    }
}
