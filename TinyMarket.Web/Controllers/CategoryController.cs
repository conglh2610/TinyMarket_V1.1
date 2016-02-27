using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Infrastructure.Services;

namespace MakingSampleCode.Controllers
{
    public class CategoryController : ApiController
    {
         private readonly ICategoryService categoryService = null;

        public CategoryController(ICategoryService categoryService)
        {
            this.categoryService = categoryService;
        }

        [HttpGet]
        public HttpResponseMessage GetAllCategories()
        {
            var categories = categoryService.GetCategories();
            return Request.CreateResponse(HttpStatusCode.OK, categories.ToList());
        }
    }
}
