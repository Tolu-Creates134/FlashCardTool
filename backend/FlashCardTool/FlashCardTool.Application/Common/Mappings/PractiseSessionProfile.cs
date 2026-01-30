using System;
using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Application.PractiseSessions;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Application.Common.Mappings;

public class PractiseSessionProfile : Profile
{
    public PractiseSessionProfile()
    {
        CreateMap<PractiseSession, PractiseSessionDto>();
    }
}
