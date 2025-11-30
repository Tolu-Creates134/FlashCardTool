using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Application.MappingProfiles;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        CreateMap<Category, CategoryDto>().ReverseMap();
    }
}
