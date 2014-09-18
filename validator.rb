require 'rubygems'
require 'sinatra'
require 'rcap'
require 'haml'
require 'coderay'
require 'rexml/formatters/pretty'
require 'open-uri'
require 'rss'
require 'timeout'

XML_FORMATTER = REXML::Formatters::Pretty.new(2)
XML_FORMATTER.compact = true

get '/' do
  haml(:index)
end

post '/validate' do
  begin
    @cap_data = params[:cap_data]
    @alert = RCAP::Alert.from_xml(@cap_data)
    @xml_string = ''
    XML_FORMATTER.write(@alert.to_xml_document, @xml_string)
    haml(:validate)
  rescue => exception
    @alert = nil
    @exception = exception
    haml(:error)
  end
end

VALIDATE_URL = lambda do
  begin
    @cap_data_url = Rack::Utils.unescape(params[:cap_data_url])
    @cap_data = open(@cap_data_url, 'User-Agent' => "Ruby/#{RUBY_VERSION}") { |f| f.read }
    @alert = RCAP::Alert.from_xml(@cap_data)
    @xml_string = ''
    XML_FORMATTER.write(@alert.to_xml_document, @xml_string)
    haml(:validate)
  rescue => exception
    @alert = nil
    @exception = exception
    haml(:error)
  end
end

post('/validate_url', &VALIDATE_URL)
get('/validate_url', &VALIDATE_URL)

helpers do
  include Rack::Utils
  alias_method(:h, :escape_html)
  alias_method(:u, :escape)

  def cycle
    @_cycle ||= reset_cycle
    @_cycle = [@_cycle.pop] + @_cycle
    @_cycle.first
  end

  def current_cycle
    @_cycle.first
  end

  def reset_cycle
    @_cycle = %w(even odd)
  end

  def validate_file_path(url)
    "/validate_url?cap_data_url=#{ u(url)}"
  end

  def recent_epa_alerts
    Timeout.timeout(10) do
      url = 'http://feeds.enviroflash.info/cap/aggregate.xml'
      open(url) do |rss|
        RSS::Parser.parse(rss).items[0..4]
      end
    end
  rescue
    []
  end
end
