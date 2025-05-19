using AutoMapper;
using FlashCardTool.Application.Models;
using FlashCardTool.Domain.Entities;
using FlashCardTool.Domain.Interfaces;
using MediatR;

namespace FlashCardTool.Application.Decks;

public record CreateDeckCommand(DeckDto Deck) : IRequest<CreateDeckResponse>;

public record CreateDeckResponse(DeckDto Deck);

public class CreateDeckCommandHandler: IRequestHandler<CreateDeckCommand, CreateDeckResponse>
{
    private readonly IUnitOfWork unitOfWork;
    private readonly IMapper mapper;

    public CreateDeckCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        this.unitOfWork = unitOfWork;
        this.mapper = mapper;
    }

    public async Task<CreateDeckResponse> Handle(CreateDeckCommand request, CancellationToken cancellationToken)
    {
        var deck = mapper.Map<Deck>(request.Deck);

        deck.Id = Guid.NewGuid();

        var created = await unitOfWork.Repository<Deck>().AddAsync(deck, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateDeckResponse(mapper.Map<DeckDto>(created));    
    }
}


