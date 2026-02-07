using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;

namespace FlashCardTool.Application.Common.Mappings;

public class DeckProfile : Profile
{
    public DeckProfile()
    {
        CreateMap<DeckDto, Deck>()
        .ForMember(dest => dest.Flashcards, opt => opt.MapFrom(src => src.FlashCards));

        CreateMap<Deck, DeckDto>()
        .ForMember(dest => dest.FlashCards, opt => opt.MapFrom(src => src.Flashcards))
        .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

        CreateMap<FlashCardDto, FlashCard>();

        CreateMap<FlashCard, FlashCardDto>();
    }
}
