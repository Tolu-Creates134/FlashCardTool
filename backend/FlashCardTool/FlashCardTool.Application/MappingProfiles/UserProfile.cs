using AutoMapper;
using FlashCardTool.Application.Users;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Application.MappingProfiles;

public class UserProfile : Profile
{
    public UserProfile()
    {
        // Map SaveUserCommand → User
        CreateMap<SaveUserCommand, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore()); // EF will generate this
    }

}
