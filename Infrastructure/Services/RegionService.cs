using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Infrastructure.Domain;

namespace Infrastructure.Services
{
    public interface IRegionService : IRepository<Region>
    {
        IQueryable<Region> GetRegions();
    }
    public class RegionService : IRegionService
    {

        private IRepository<Region> regionRepository = null;
        public RegionService(IRepository<Region> regionRepository)
        {
            this.regionRepository = regionRepository;
        }


        public IQueryable<Region> Get { get; private set; }
        public Region Find(object[] keyValues)
        {
            throw new NotImplementedException();
        }

        public Region Find(int id)
        {
            throw new NotImplementedException();
        }

        public Region Find(string id)
        {
            throw new NotImplementedException();
        }

        public Region Add(Region entity)
        {
            throw new NotImplementedException();
        }

        public Region Update(Region entity)
        {
            throw new NotImplementedException();
        }

        public Region AddOrUpdate(Region entity)
        {
            throw new NotImplementedException();
        }

        public void Remove(object[] keyValues)
        {
            throw new NotImplementedException();
        }

        public void Remove(Region entity)
        {
            throw new NotImplementedException();
        }

        public void Commit()
        {
            throw new NotImplementedException();
        }
        public IQueryable<Region> GetRegions()
        {
            return regionRepository.Get;
        }
    }
}
