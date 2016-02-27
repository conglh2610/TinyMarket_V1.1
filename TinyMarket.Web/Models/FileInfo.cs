using Google.Apis.Drive.v2.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TinyMarket.Web.Models
{
    public class FileInfo
    {
        public string Id { get; set; }
        public File ImageFile { get; set; }
    }
}