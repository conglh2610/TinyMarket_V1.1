using System.Collections.ObjectModel;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Newtonsoft.Json;
using TinyMarket.Web.GoogleApiHelper;
using Google.Apis.Drive.v2.Data;
using Google.Apis.Drive.v2;
using Google.Apis.Services;
using Google.Apis.Upload;
using Google.Apis.Util.Store;
using Infrastructure.Constants;
using Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web.Http;
using Google.Apis;
using System.IO;
using System.Web;
using Newtonsoft.Json.Linq;
using File = System.IO.File;
using Infrastructure.Domain;
using Infrastructure.Criteria;

namespace TinyMarket.Web.Controllers
{
    public class PostsController : ApiController
    {
        private object criteria;
        private readonly IPostService postService = null;

        public PostsController(IPostService postService)
        {
            this.postService = postService;
        }

        [HttpPost]
        public async Task<HttpResponseMessage> SavePost()
        {
            Posts post;
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            string uploadPath = HttpContext.Current.Server.MapPath("~/") + "UploadFiles";
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);
            List<Google.Apis.Drive.v2.Data.File> files = null;
            try
            {
                var provider = new MultipartFormDataStreamProvider(uploadPath);
                var result = await Request.Content.ReadAsMultipartAsync(provider);
                if (result.FormData["model"] == null)
                {
                    throw new HttpResponseException(HttpStatusCode.BadRequest);
                }
                
                //get the files
                foreach (var file in result.FileData)
                {
                    //TODO: Do something with each uploaded file
                }
                ClientSecrets secrets = new ClientSecrets
                {
                    ClientId = Constants.CLIENT_ID,
                    ClientSecret = Constants.CLIENT_SECRET
                };

                var fileDataStore = new FileDataStore(HttpContext.Current.Server.MapPath("~/") + "Resources");

                UserCredential credential = await GoogleWebAuthorizationBroker.AuthorizeAsync(
                    secrets,
                    new[] { DriveService.Scope.Drive },
                    "lhcongtk32@gmail.com",
                    CancellationToken.None, fileDataStore
                    );

                var service = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = Constants.APP_USER_AGENT
                });

                string Q = "title = 'TinyMarket_Folder' and mimeType = 'application/vnd.google-apps.folder'";
                IList<Google.Apis.Drive.v2.Data.File> _Files = GoogleApiHelper.GoogleApiHelper.GetFiles(service, Q);
                if (_Files.Count == 0)
                {
                    _Files.Add(GoogleApiHelper.GoogleApiHelper.createDirectory(service, "TinyMarket_Folder",
                        "TinyMarket_Folder", "root"));
                }

                if (_Files.Count != 0 && result.FileData.Count > 0)
                {
                    string directoryId = _Files[0].Id;

                    files = GoogleApiHelper.GoogleApiHelper.UploadFileFromRequest(service, result.FileData, directoryId);
                    var list = service.Files.Get(files[0].Id);
                }


                var model = result.FormData["model"];

                post = JsonConvert.DeserializeObject<Posts>(model);
                postService.Add(post);

            }
            catch (Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e.Message);
            }
            finally
            {
                string[] filesToDelete = Directory.GetFiles(uploadPath);
                foreach (string file in filesToDelete)
                {
                    if (File.Exists(file))
                    {
                        GC.Collect();
                        GC.WaitForPendingFinalizers();
                        FileInfo f = new FileInfo(file);
                        f.Delete();
                    }
                }
            }
            
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGet]
        public HttpResponseMessage SearchPosts()
        {
            IQueryable <Posts> result = null;
            int totalRecords = 0;
            try
            {
                PostCriteria criteria = null;
                 result = postService.SearchPost(criteria, ref totalRecords);
            }
            catch (Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e.Message);
            }

            return Request.CreateResponse(HttpStatusCode.OK, result);
        }


    }
}
