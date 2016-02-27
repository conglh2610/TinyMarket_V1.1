using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Infrastructure.Criteria;
using Infrastructure.Domain;

namespace Infrastructure.Services
{
    public interface IPostService : IRepository<Posts>
    {
        IQueryable<Posts> GetPosts();
        IQueryable<Posts> SearchPost(PostCriteria criteria, ref int totalRecords);
    }
    public class PostService : IPostService
    {

        private IRepository<Posts> postRepository = null;
        public PostService(IRepository<Posts> postRepository)
        {
            this.postRepository = postRepository;
        }


        public IQueryable<Posts> Get { get; private set; }
        public Posts Find(object[] keyValues)
        {
            throw new NotImplementedException();
        }

        public Posts Find(int id)
        {
            throw new NotImplementedException();
        }

        public Posts Find(string id)
        {
            throw new NotImplementedException();
        }

        public Posts Add(Posts entity)
        {
            Posts result = null;
            if (entity != null)
            {
                entity.CreateDate = DateTime.Now;
                entity.LastChangeDate = DateTime.Now;
                result = postRepository.Add(entity);
            }

            return result;
        }

        public Posts Update(Posts entity)
        {
            throw new NotImplementedException();
        }

        public Posts AddOrUpdate(Posts entity)
        {
            throw new NotImplementedException();
        }

        public void Remove(object[] keyValues)
        {
            throw new NotImplementedException();
        }

        public void Remove(Posts entity)
        {
            throw new NotImplementedException();
        }

        public void Commit()
        {
            throw new NotImplementedException();
        }

        public IQueryable<Posts> GetPosts()
        {
            throw new NotImplementedException();
        }

        public IQueryable<Posts> SearchPost(PostCriteria criteria, ref int totalRecords)
        {
            var query = postRepository.Get
                .Include(t => t.CategoryDetail)
                .Include(t => t.Region).AsQueryable();
            // .Where(t=>(string.IsNullOrEmpty(criteria.SearchText))

            totalRecords = query.Count();
            return query;
            
        }
    }
}
