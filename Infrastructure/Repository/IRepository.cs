using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace Infrastructure
{
    public interface IRepository<T> where T : class
    {
        IQueryable<T> Get { get; }
        T Find(object[] keyValues);
        T Find(int id);
        T Find(string id);
        T Add(T entity);
        T Update(T entity);
        T AddOrUpdate(T entity);
        void Remove(object[] keyValues);
        void Remove(T entity);
        void Commit();
        
    }
}
